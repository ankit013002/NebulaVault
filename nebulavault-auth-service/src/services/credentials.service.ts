import pool from "../db";
import { Credential, RefreshToken } from "../types/database";

/**
 * Retrieves user credentials from the database based on the provided email.
 *
 * @param email
 * @returns
 */
export async function retrieveCredentialsByEmail(
  email: string,
): Promise<Credential | null> {
  const result = await pool.query(
    `
      SELECT * FROM credentials
      WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
}

/**
 * Creates a new refresh token for the specified credential ID, token hash, and expiration date.
 *
 * @param credentialId
 * @param tokenHash
 * @param expiresAt
 * @returns
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
 * Creates a new email verification token for the specified credential ID and token hash.
 *
 * @param credentialId
 * @param tokenHash
 */
export async function createVerficationToken(
  credentialId: string,
  tokenHash: string,
): Promise<void> {
  await pool.query(
    `
          INSERT INTO email_verification_tokens
          values ($1, $2, $3)  
        `,
    [credentialId, tokenHash, new Date(Date.now() + 24 * 60 * 60 * 1000)],
  );
}
