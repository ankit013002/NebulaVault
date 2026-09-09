import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AppConfig } from "../config/env.js";
import type { StorageDriver, StoredObject, UploadTarget } from "./types.js";

/**
 * Filesystem-backed driver used in development and CI.
 *
 * It deliberately mirrors S3's presigning contract — URLs are HMAC-signed and
 * expire — so the browser upload flow is identical in both modes and the S3
 * path is not a separate, untested code branch.
 */
export class LocalStorageDriver implements StorageDriver {
  readonly name = "local" as const;
  readonly bucket = "local";

  private readonly rootDir: string;
  private readonly publicBaseUrl: string;
  private readonly ttl: number;
  private readonly secret: Buffer;

  constructor(cfg: AppConfig, secret?: Buffer) {
    this.rootDir = path.resolve(cfg.local.rootDir);
    this.publicBaseUrl = cfg.local.publicBaseUrl.replace(/\/+$/, "");
    this.ttl = cfg.presignTtlSeconds;
    // Ephemeral per process: restarting invalidates outstanding URLs, which is
    // the correct behaviour for a dev-only driver.
    this.secret = secret ?? randomBytes(32);
  }

  /**
   * Object keys are built by this service (never by the client), but resolving
   * defensively keeps a future bug from turning into a path traversal.
   */
  private absolutePathFor(key: string): string {
    const resolved = path.resolve(this.rootDir, key);
    const root = this.rootDir + path.sep;
    if (resolved !== this.rootDir && !resolved.startsWith(root)) {
      throw new Error(`Refusing to access key outside storage root: ${key}`);
    }
    return resolved;
  }

  sign(key: string, expiresAtMs: number): string {
    return createHmac("sha256", this.secret)
      .update(`${key}:${expiresAtMs}`)
      .digest("hex");
  }

  /** Constant-time verification of a URL produced by `sign`. */
  verify(key: string, expiresAtMs: number, signature: string): boolean {
    if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) return false;
    const expected = Buffer.from(this.sign(key, expiresAtMs), "utf8");
    const actual = Buffer.from(signature, "utf8");
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }

  private buildUrl(key: string, extra?: Record<string, string>): string {
    const expiresAt = Date.now() + this.ttl * 1000;
    const params = new URLSearchParams({
      exp: String(expiresAt),
      sig: this.sign(key, expiresAt),
      ...extra,
    });
    const encodedKey = key.split("/").map(encodeURIComponent).join("/");
    return `${this.publicBaseUrl}/${encodedKey}?${params.toString()}`;
  }

  async createUploadTarget(input: {
    key: string;
    contentType: string;
    contentLength: number;
  }): Promise<UploadTarget> {
    return {
      url: this.buildUrl(input.key),
      method: "PUT",
      headers: {
        "Content-Type": input.contentType,
        "Content-Length": String(input.contentLength),
      },
      expiresAt: new Date(Date.now() + this.ttl * 1000).toISOString(),
    };
  }

  async createDownloadUrl(input: {
    key: string;
    filename: string;
  }): Promise<string> {
    return this.buildUrl(input.key, { filename: input.filename });
  }

  async headObject(key: string): Promise<StoredObject | null> {
    try {
      const info = await stat(this.absolutePathFor(key));
      return { bytes: info.size, contentType: undefined, etag: undefined };
    } catch (err) {
      if (isEnoent(err)) return null;
      throw err;
    }
  }

  async putObject(key: string, body: Buffer): Promise<void> {
    const abs = this.absolutePathFor(key);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, body);
  }

  createReadStreamFor(key: string): NodeJS.ReadableStream {
    return createReadStream(this.absolutePathFor(key));
  }

  async deleteObject(key: string): Promise<void> {
    await rm(this.absolutePathFor(key), { force: true });
  }

  async deleteObjects(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteObject(key)));
  }
}

function isEnoent(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "ENOENT"
  );
}
