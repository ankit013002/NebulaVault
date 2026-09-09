/**
 * Storage is abstracted so the service runs against S3 in the cloud and a
 * local directory in development, with no AWS credentials required to boot.
 */

export interface UploadTarget {
  /** URL the browser PUTs the raw bytes to. */
  url: string;
  method: "PUT";
  /** Headers the browser must replay exactly, or the signature will not match. */
  headers: Record<string, string>;
  /** Absolute expiry, so clients can decide whether to re-request. */
  expiresAt: string;
}

export interface StoredObject {
  bytes: number;
  contentType: string | undefined;
  etag: string | undefined;
}

export interface StorageDriver {
  readonly name: "s3" | "local";
  /** Bucket name for S3; a sentinel for local, recorded on the FileVersion. */
  readonly bucket: string;

  /** Pre-authorize a single-object upload at `key`. */
  createUploadTarget(input: {
    key: string;
    contentType: string;
    contentLength: number;
  }): Promise<UploadTarget>;

  /** Time-limited download URL; `filename` drives Content-Disposition. */
  createDownloadUrl(input: { key: string; filename: string }): Promise<string>;

  /** Returns null when the object is absent. */
  headObject(key: string): Promise<StoredObject | null>;

  deleteObject(key: string): Promise<void>;

  /** Best-effort bulk delete used when a subtree is purged. */
  deleteObjects(keys: string[]): Promise<void>;
}
