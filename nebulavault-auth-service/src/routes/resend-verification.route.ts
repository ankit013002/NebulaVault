import { Router, Request, Response } from "express";
import resendVerification from "../controller/resend-verification-controller";

const router = Router();

router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    await resendVerification({ session: req.cookies.session });
    return res.status(200).json({
      message: "Verification email resent successfully",
    });
  } catch (err) {
    if (err instanceof Error && err.name === "SessionTokenMissingError") {
      return res.status(400).json({ error: "Session token not provided" });
    }

    if (err instanceof Error && err.name === "InvalidSessionTokenError") {
      return res.status(401).json({ error: "Invalid session token" });
    }

    if (err instanceof Error && err.name === "EmailAlreadyVerifiedError") {
      return res.status(400).json({ error: "Email is already verified" });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
