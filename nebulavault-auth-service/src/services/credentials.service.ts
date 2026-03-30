import pool from "../db";
import { Credential, RefreshToken } from "../types/database";

/**
 * Retrieves user credentials from the database based on the provided email.
 *
 * @param email
 * @returns A promise resolving to the user credentials or null if not found.
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

/**
 * Retrieves user credentials from the database based on the provided credential ID.
 *
 * @param credentialId
 * @returns A promise resolving to the user credentials or null if not found.
 */
export async function retrieveCredentialsByCredentialId(
  credentialId: string,
): Promise<Credential | null> {
  const result = await pool.query(
    `
        SELECT * FROM credentials
        WHERE id = $1`,
    [credentialId],
  );
  return result.rows[0] || null;
}
