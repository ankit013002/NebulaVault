import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type PermissionRole = "editor" | "viewer";

export interface Permission {
  nodeId: Types.ObjectId;
  principal: string;
  role: PermissionRole;
  grantedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PermissionDocument = HydratedDocument<Permission>;

const permissionSchema = new Schema<Permission>(
  {
    nodeId: {
      type: Schema.Types.ObjectId,
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
      enum: { values: ["editor", "viewer"], message: "{VALUE} must be 'editor' or 'viewer'" },
      required: [true, "role is required"],
    },
    grantedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

permissionSchema.index({ nodeId: 1, principal: 1 }, { unique: true });
permissionSchema.index({ principal: 1, nodeId: 1 });

export const PermissionModel: Model<Permission> =
  (mongoose.models["Permission"] as Model<Permission>) ??
  mongoose.model<Permission>("Permission", permissionSchema);

export default PermissionModel;
