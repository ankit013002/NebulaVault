import { Router } from "express";

import {
  completeUploadsHandler,
  downloadHandler,
  listDirectoryHandler,
  presignUploadsHandler,
  usageHandler,
} from "../controllers/files.controller.js";
import { requireUser } from "../middleware/requireUser.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireUser);

router.get("/", asyncHandler(listDirectoryHandler));
router.get("/usage", asyncHandler(usageHandler));
router.post("/uploads", asyncHandler(presignUploadsHandler));
router.post("/uploads/complete", asyncHandler(completeUploadsHandler));
router.get("/:nodeId/download", asyncHandler(downloadHandler));

export default router;
