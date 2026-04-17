import { Router, Request, Response } from "express";
import { passwordResetLimiter } from "../lib/rateLimiter";
import forgotPassword from "../controller/forgot-password.controller";

const router = Router();

router.post(
  "/forgot-password",
  passwordResetLimiter,
  async (req: Request, res: Response) => {
    try {
      const data = req.body as { email: string };
      await forgotPassword(data);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(200).json({ ok: true });
    }
  },
);

export default router;
