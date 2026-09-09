import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type UploadStatus = "pending" | "committed";

export interface FileVersion {
  nodeId: Types.ObjectId;
  ownerId: string;
  version: number;
  bytes: number;
  contentType?: string;
  etag?: string;
  sha256?: string;
  storage: {
    driver: string;
    bucket: string;
    key: string;
  };
  /**
   * "pending" is written before the browser uploads; it flips to "committed"
   * only after the object is confirmed present in storage. Rows left pending
   * represent abandoned uploads and are safe to reap.
   */
  status: UploadStatus;
  uploadedBy: string;
  uploadedAt: Date;
  isCurrent: boolean;
  meta: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type FileVersionDocument = HydratedDocument<FileVersion>;

const fileVersionSchema = new Schema<FileVersion>(
  {
    nodeId: {
      type: Schema.Types.ObjectId,
      ref: "DriveNode",
      required: [true, "nodeId (DriveNode reference) is required"],
      index: true,
    },
    ownerId: { type: String, required: [true, "must have owner"], index: true },
    version: { type: Number, min: 1, required: true },
    bytes: { type: Number, default: 0, min: 0 },
    contentType: { type: String },
    etag: { type: String, trim: true },
    sha256: { type: String, trim: true },
    storage: {
      driver: { type: String, required: [true, "storage.driver is required"] },
      bucket: { type: String, required: [true, "storage.bucket is required"] },
      key: { type: String, required: [true, "storage.key is required"] },
    },
    status: {
      type: String,
      enum: { values: ["pending", "committed"], message: "{VALUE} is not a valid status" },
      default: "pending",
      index: true,
    },
    uploadedBy: { type: String, required: [true, "uploadedBy is required"] },
    uploadedAt: { type: Date, default: Date.now },
    isCurrent: { type: Boolean, default: false, index: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// At most one current version per node.
fileVersionSchema.index(
  { nodeId: 1, isCurrent: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true } }
);
fileVersionSchema.index({ nodeId: 1, version: -1 }, { unique: true });
// Supports reaping abandoned uploads.
fileVersionSchema.index({ status: 1, createdAt: 1 });

export const FileVersionModel: Model<FileVersion> =
  (mongoose.models["FileVersion"] as Model<FileVersion>) ??
  mongoose.model<FileVersion>("FileVersion", fileVersionSchema);

export default FileVersionModel;
