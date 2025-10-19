const mongoose = require("mongoose");

const fileVersionSchema = new mongoose.Schema(
  {
    nodeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "DriveNode",
      required: [true, "nodeId (DriveNode reference) is required"],
      index: true,
    },
    ownerId: {
      type: String,
      required: [true, "must have owner"],
      index: true,
    },
    version: {
      type: Number,
      min: 1,
      required: true,
    },
    bytes: {
      type: Number,
      default: 0,
    },
    contentType: {
      type: String,
    },
    etag: {
      type: String,
      trim: true,
    },
    sha256: {
      type: String,
      trim: true,
    },
    s3: {
      bucket: {
        type: String,
        required: [true, "s3.bucket is required"],
      },
      key: {
        type: String,
        required: [true, "s3.key is required"],
      },
    },
    uploadedBy: {
      type: String,
      required: [true, "uploadedBy is required"],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

fileVersionSchema.index(
  { nodeId: 1, isCurrent: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true } }
);

fileVersionSchema.index({ nodeId: 1, version: -1 }, { unique: true });

module.exports = mongoose.model("FileVersion", fileVersionSchema);
