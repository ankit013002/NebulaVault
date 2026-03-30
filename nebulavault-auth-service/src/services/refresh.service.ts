import pool from "../db";
import { RefreshToken } from "../types/database";

/**
 * Creates a new refresh token for the specified credential ID, token hash, and expiration date.
 *
 * @param credentialId
 * @param tokenHash
 * @param expiresAt
 * @returns A promise resolving to the created refresh token record from the database.
 */
export async function createRefreshToken(
  credentialId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<RefreshToken> {
  const result = await pool.query(
    `
      INSERT INTO refresh_tokens (credential_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id`,
    [credentialId, tokenHash, expiresAt],
  );

  return result.rows[0];
}

/**
 * Retrieves a refresh token from the database based on the provided token hash and current date.
 *
 * @param refresh_token
 * @param now
 * @returns A promise resolving to the refresh token record if found and valid, or null if not found or expired.
 */
export async function retrieveRefreshToken(
  refresh_token: string,
  now: Date,
): Promise<any> {
  const result = await pool.query(
    `
            SELECT * FROM refresh_tokens
            WHERE token_hash = $1 AND expires_at > $2
        `,
    [refresh_token, now],
  );

  return result.rows[0];
}

/**
 * Deletes a refresh token from the database based on the provided token ID.
 *
 * @param tokenId
 */
export async function deleteRefreshTokenWithId(tokenId: string): Promise<void> {
  await pool.query(
    `
      DELETE FROM refresh_tokens WHERE id = $1;
    `,
    [tokenId],
  );
}
