import { Router } from "express";

import {
  deleteNodeHandler,
  listDirectoryHandler,
} from "../controllers/files.controller.js";
import { requireUser } from "../middleware/requireUser.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireUser);

// Retained so existing clients keep working after uploads moved under /files.
router.get("/", asyncHandler(listDirectoryHandler));
router.delete("/:nodeId", asyncHandler(deleteNodeHandler));

export default router;
