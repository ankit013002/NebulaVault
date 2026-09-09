import { Router } from "express";
import { z } from "zod";

import { requireUser } from "../../middleware/requireUser.js";
import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getVaultSummary, renameVault } from "./vaults.service.js";

const router = Router();

router.use(requireUser);

const renameSchema = z.object({ name: z.string().min(1).max(120) });

function ownerOf(req: { ownerId?: string }): string {
  if (!req.ownerId) throw AppError.unauthorized();
  return req.ownerId;
}

/** The Vault screen: capacity, usage and device health in one call. */
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const summary = await getVaultSummary(ownerOf(req));
    res.status(200).json({ data: summary });
  })
);

router.patch(
  "/me",
  asyncHandler(async (req, res) => {
    const result = renameSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest("Request validation failed", z.flattenError(result.error));
    }
    const vault = await renameVault(ownerOf(req), result.data.name);
    res.status(200).json({ data: { id: vault.id, name: vault.name } });
  })
);

export default router;
