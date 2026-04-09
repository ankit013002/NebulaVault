import { Router, Request, Response } from "express";
import { z } from "zod";
import { setAuthCookies } from "../lib/cookies";
import { loginSchema } from "../lib/schema";
import { loginLimiter } from "../lib/rateLimiter";
import loginController from "../controller/login.controller";

const router = Router();

router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const { accessToken, refreshToken, emailVerified } =
      await loginController(data);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      ok: true,
      emailVerified: emailVerified,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: err.issues });
    }

    if (err instanceof Error && err.name === "InvalidCredentialsError") {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
