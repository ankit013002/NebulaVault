import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { AppConfig } from "../config/env.js";
import type { StorageDriver, StoredObject, UploadTarget } from "./types.js";

/** S3 caps a single DeleteObjects request at 1000 keys. */
const DELETE_BATCH_SIZE = 1000;

export class S3StorageDriver implements StorageDriver {
  readonly name = "s3" as const;
  readonly bucket: string;

  private readonly client: S3Client;
  private readonly ttl: number;

  constructor(cfg: AppConfig, client?: S3Client) {
    this.bucket = cfg.s3.bucket;
    this.ttl = cfg.presignTtlSeconds;
    this.client =
      client ??
      new S3Client({
        region: cfg.s3.region,
        ...(cfg.s3.endpoint ? { endpoint: cfg.s3.endpoint } : {}),
        forcePathStyle: cfg.s3.forcePathStyle,
      });
  }

  async createUploadTarget(input: {
    key: string;
    contentType: string;
    contentLength: number;
  }): Promise<UploadTarget> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: this.ttl,
      // Both headers are part of the signature, so the browser must send them
      // back byte-for-byte. Listing them keeps that contract explicit.
      signableHeaders: new Set(["content-type", "content-length"]),
    });

    return {
      url,
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
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      ResponseContentDisposition: contentDisposition(input.filename),
    });
    return getSignedUrl(this.client, command, { expiresIn: this.ttl });
  }

  async headObject(key: string): Promise<StoredObject | null> {
    try {
      const out = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key })
      );
      return {
        bytes: out.ContentLength ?? 0,
        contentType: out.ContentType,
        etag: out.ETag?.replaceAll('"', ""),
      };
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  async deleteObjects(keys: string[]): Promise<void> {
    for (let i = 0; i < keys.length; i += DELETE_BATCH_SIZE) {
      const batch = keys.slice(i, i + DELETE_BATCH_SIZE);
      if (batch.length === 0) continue;
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        })
      );
    }
  }
}

function isNotFound(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const name = (err as { name?: string }).name;
  const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode;
  return name === "NotFound" || name === "NoSuchKey" || status === 404;
}

/**
 * RFC 5987 encoding so non-ASCII filenames survive the round trip; the plain
 * `filename` stays as an ASCII fallback for older clients.
 */
export function contentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
