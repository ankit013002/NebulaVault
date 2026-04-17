import { Router, Request, Response } from "express";
import { handleVerifyEmail } from "../controller/verify-email.controller";

const router = Router();
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";

router.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const token = req.query.token;
    await handleVerifyEmail(token);
    return res.redirect(`${APP_ORIGIN}/verify-email?status=success`);
  } catch (err) {
    if (err instanceof Error && err.name === "MissingTokenError") {
      return res.redirect(`${APP_ORIGIN}/verify-email?status=missing`);
    }

    console.error(err);
    return res.redirect(`${APP_ORIGIN}/verify-email?status=invalid`);
  }
});

export default router;
