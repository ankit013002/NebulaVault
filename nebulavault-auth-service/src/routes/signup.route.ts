import { Router, Request, Response } from "express";
import { signupSchema } from "../lib/schema";
import { signupLimiter } from "../lib/rateLimiter";
import createUser from "../controller/signup.controller";
import { setAuthCookies } from "../lib/cookies";

export const router = Router();

router.post("/signup", signupLimiter, async (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body);
    const { accessToken, refreshToken } = await createUser(data);
    setAuthCookies(res, accessToken, refreshToken);
    return res.status(201).json({
      message: "Successfully signed up",
      ok: true,
      emailVerified: false,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "UserExistsError") {
      return res.status(409).json({ error: "Email already in use" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
