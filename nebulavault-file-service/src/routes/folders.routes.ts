import { Router } from "express";

import {
  createFoldersHandler,
  listDirectoryHandler,
} from "../controllers/files.controller.js";
import { requireUser } from "../middleware/requireUser.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireUser);

router.get("/", asyncHandler(listDirectoryHandler));
router.post("/", asyncHandler(createFoldersHandler));

export default router;
