const mongoose = require("mongoose");

const driveNodeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ["file", "folder"],
        message: (props) => `${props.value} must be either 'file' or 'folder'`,
      },
      required: [true, "type is required"],
    },
    name: {
      type: String,
      required: [true, "file name is required"],
      trim: true,
    },
    nameLower: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    path: {
      type: String,
      required: [true, "path required"],
      trim: true,
    },
    parentId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "DriveNode",
      default: null,
    },
    ancestors: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "DriveNode",
      },
    ],
    bytes: {
      type: Number,
      default: 0,
    },
    contentType: {
      type: String,
    },
    ext: {
      type: String,
    },
    versionsCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    originalPath: {
      type: String,
    },
    originalParentId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "DriveNode",
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

driveNodeSchema.pre("validate", function (next) {
  if (this.name) this.nameLower = this.name.toLowerCase();

  let p = (this.path || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (p && !p.endsWith("/")) p += "/";
  this.path = p;

  if (this.type === "file" && !this.ext) {
    const m = this.name.match(/\.[^.]+$/);
    this.ext = m ? m[0] : "";
  }
  next();
});

driveNodeSchema.index(
  { ownerId: 1, path: 1, nameLower: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

driveNodeSchema.index({ ownerId: 1, path: 1, type: 1, isDeleted: 1 });

driveNodeSchema.index({ ownerId: 1, updatedAt: -1, isDeleted: 1 });

module.exports = mongoose.model("DriveNode", driveNodeSchema);
