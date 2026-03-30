import pool from "../db";

/**
 * Deletes a refresh token from the database based on the provided token hash.
 * This function is used during the logout process to invalidate the refresh token,
 * ensuring that it can no longer be used to obtain new access tokens.
 */
export async function deleteRefreshTokenWithHash(
  tokenHash: string,
): Promise<void> {
  await pool.query(
    `
        DELETE FROM refresh_tokens WHERE token_hash = $1;
    `,
    [tokenHash],
  );
}
