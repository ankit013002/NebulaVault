import pool from "../db";

export async function deleteRefreshToken(tokenHash: string): Promise<void> {
  await pool.query(
    `
            DELETE FROM refresh_tokens WHERE token_hash = $1;
            `,
    [tokenHash],
  );
}
