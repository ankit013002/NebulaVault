import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../db/index";
import { signAccessToken, makeOpaqueToken, hashToken } from "../lib/tokens";
import { setAuthCookies } from "../lib/cookies";
import { sendVerificationEmail } from "../lib/mailer";
import { signupSchema } from "../lib/schema";
import { signupLimiter } from "../lib/rateLimiter";

export const router = Router();

router.post("/signup", signupLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // handle error in catch
    signupSchema.parse({ email, password, name });

    const result = await pool.query(
      `SELECT * FROM credentials WHERE email = $1`,
      [email],
    );

    if (result.rows.length > 0) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const saltRounds = 12;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const insertResult = await pool.query(
      `
      INSERT INTO credentials (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [email, hashedPassword, name],
    );

    const rawToken = makeOpaqueToken();

    const hashedToken = hashToken(rawToken);

    await pool.query(
      `
      INSERT INTO email_verification_tokens
      values ($1, $2, $3)  
    `,
      [
        insertResult.rows[0].id,
        hashedToken,
        new Date(Date.now() + 24 * 60 * 60 * 1000),
      ],
    );

    await sendVerificationEmail(email, rawToken);

    const accessToken = signAccessToken(insertResult.rows[0].id, email);

    const refreshToken = makeOpaqueToken();
    const hashedRefreshToken = hashToken(refreshToken);

    await pool.query(
      `
      INSERT INTO refresh_tokens
      VALUES ($1, $2, $3)`,
      [
        insertResult.rows[0].id,
        hashedRefreshToken,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ],
    );

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      message: "Successfully signed up",
      ok: true,
      emailVerified: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});
