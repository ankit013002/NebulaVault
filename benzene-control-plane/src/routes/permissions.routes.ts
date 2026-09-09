import { Router } from "express";

import PermissionModel from "../models/permission.model.js";
import { requireUser } from "../middleware/requireUser.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireUser);

// Sharing is not implemented yet; this lists grants already addressed to the
// caller so the endpoint reports real state instead of a placeholder string.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const grants = await PermissionModel.find({ principal: req.ownerId }).lean();
    res.status(200).json({
      data: grants.map((g) => ({
        nodeId: g.nodeId.toString(),
        role: g.role,
        grantedBy: g.grantedBy ?? null,
      })),
    });
  })
);

export default router;
