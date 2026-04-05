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
  } catch (err) {
    if (err instanceof Error && err.name === "UserExistsError") {
      return res.status(409).json({ error: "Email already in use" });
    }

    if (err instanceof Error && err.name === "UserCreationError") {
      return res.status(500).json({ error: "Failed to create user" });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
