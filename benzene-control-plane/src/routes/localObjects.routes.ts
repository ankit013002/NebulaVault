import { Router, raw } from "express";

import { config } from "../config/env.js";
import { LocalStorageDriver } from "../storage/local.driver.js";
import { storage } from "../storage/index.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { contentDisposition } from "../storage/s3.driver.js";

const router = Router();

/**
 * Serves the local storage driver's presigned URLs.
 *
 * This exists only so development exercises the same browser-side upload path
 * as production: the client PUTs bytes to a signed URL it was handed, rather
 * than posting a multipart form to the API. In S3 mode this router is not
 * mounted at all.
 */

function driverOrThrow(): LocalStorageDriver {
  const driver = storage();
  if (!(driver instanceof LocalStorageDriver)) {
    throw AppError.notFound("Local object storage is not enabled");
  }
  return driver;
}

/** Express 5 exposes a named wildcard as an array of decoded segments. */
function keyFrom(splat: unknown): string {
  const segments = Array.isArray(splat) ? splat : [splat];
  return segments.filter((s): s is string => typeof s === "string").join("/");
}

function assertSigned(driver: LocalStorageDriver, key: string, query: unknown): void {
  const q = (query ?? {}) as Record<string, unknown>;
  const exp = Number(q["exp"]);
  const sig = typeof q["sig"] === "string" ? q["sig"] : "";
  if (!driver.verify(key, exp, sig)) {
    throw AppError.unauthorized("Invalid or expired signature");
  }
}

router.put(
  "/*splat",
  raw({ type: () => true, limit: "512mb" }),
  asyncHandler(async (req, res) => {
    const driver = driverOrThrow();
    const key = keyFrom(req.params["splat"]);
    assertSigned(driver, key, req.query);

    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    await driver.putObject(key, body);

    res.status(200).json({ bytes: body.length });
  })
);

router.get(
  "/*splat",
  asyncHandler(async (req, res) => {
    const driver = driverOrThrow();
    const key = keyFrom(req.params["splat"]);
    assertSigned(driver, key, req.query);

    const stored = await driver.headObject(key);
    if (!stored) throw AppError.notFound("Object not found");

    const filename =
      typeof req.query["filename"] === "string" ? req.query["filename"] : "download";

    res.setHeader("Content-Length", String(stored.bytes));
    res.setHeader("Content-Disposition", contentDisposition(filename));
    driver.createReadStreamFor(key).pipe(res);
  })
);

export default router;

/** True when the local driver is selected and this router should be mounted. */
export function localObjectsEnabled(): boolean {
  return config().storageDriver === "local";
}
