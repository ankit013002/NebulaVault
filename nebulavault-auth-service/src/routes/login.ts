import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../db/index";
import { signAccessToken, makeOpaqueToken, hashToken } from "../lib/tokens";
import { setAuthCookies } from "../lib/cookies";
import { loginSchema } from "../lib/schema";
import { loginLimiter } from "../lib/rateLimiter";

const router = Router();

router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    loginSchema.parse({ email, password });

    const queryResult = await pool.query(
      `
      SELECT * FROM credentials
      WHERE email = $1
      `,
      [email],
    );

    if (queryResult.rows.length == 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      queryResult.rows[0].password_hash || "",
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = signAccessToken(queryResult.rows[0].id, email);

    const rawRefreshToken = makeOpaqueToken();
    const hashedRefreshToken = hashToken(rawRefreshToken);

    await pool.query(
      `
      INSERT INTO refresh_tokens (credential_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [
        queryResult.rows[0].id,
        hashedRefreshToken,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ],
    );

    setAuthCookies(res, accessToken, rawRefreshToken);

    return res.status(200).json({
      ok: true,
      emailVerified: queryResult.rows[0].email_verified,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
