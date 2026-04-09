import { Router, Request, Response } from "express";
import { passwordResetLimiter } from "../lib/rateLimiter";
import resetPassword from "../controller/reset-password-controller";

const router = Router();

router.post(
  "/reset-password",
  passwordResetLimiter,
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      await resetPassword(data);
      return res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof Error && err.name === "InvalidTokenError") {
        return res.status(400).json({ error: "Invalid or expired reset link" });
      }
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
