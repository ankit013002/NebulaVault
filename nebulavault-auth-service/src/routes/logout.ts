import { Router, Request, Response } from "express";
import pool from "../db/index";
import { hashToken } from "../lib/tokens";
import { clearAuthCookies } from "../lib/cookies";

const router = Router();

router.post("/logout", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      const hashedRefreshToken = hashToken(refreshToken);

      await pool.query(
        `
        DELETE FROM refresh_tokens WHERE token_hash = $1;
        `,
        [hashedRefreshToken],
      );
    }

    clearAuthCookies(res);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error during logout:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
