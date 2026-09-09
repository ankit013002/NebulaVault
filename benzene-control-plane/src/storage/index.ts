import { config } from "../config/env.js";
import { LocalStorageDriver } from "./local.driver.js";
import { S3StorageDriver } from "./s3.driver.js";
import type { StorageDriver } from "./types.js";

let cached: StorageDriver | undefined;

export function storage(): StorageDriver {
  if (!cached) {
    const cfg = config();
    cached =
      cfg.storageDriver === "s3"
        ? new S3StorageDriver(cfg)
        : new LocalStorageDriver(cfg);
  }
  return cached;
}

/** Test seam: swap in a fake driver. */
export function setStorageDriver(driver: StorageDriver | undefined): void {
  cached = driver;
}

export type { StorageDriver, StoredObject, UploadTarget } from "./types.js";
export { LocalStorageDriver } from "./local.driver.js";
export { S3StorageDriver } from "./s3.driver.js";
