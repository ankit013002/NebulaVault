const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    nodeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "DriveNode",
      required: [true, "nodeId (DriveNode reference) is required"],
      index: true,
    },
    principal: {
      type: String,
      required: [true, "UserId or email is required for principal"],
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: {
        values: ["editor", "viewer"],
        message: (props) => `${props.value} must be 'editor' or 'viewer'`,
      },
      required: [true, "role is required"],
    },
    grantedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

permissionSchema.index({ nodeId: 1, principal: 1 }, { unique: true });

permissionSchema.index({ principal: 1, nodeId: 1 });

module.exports = mongoose.model("Permission", permissionSchema);
