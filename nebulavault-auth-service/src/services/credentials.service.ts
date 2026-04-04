import pool from "../db";
import { Credential } from "../types/database";

/**
 * Retrieves user credentials from the database based on the provided email.
 *
 * @param email - The email address associated with the credentials to retrieve.
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
 * Retrieves user credentials from the database based on the provided credential ID.
 *
 * @param credentialId - The ID of the credential to retrieve.
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

/**
 * Updates the credentials table to set the email_verified field for a specific credential ID.
 *
 * @param credentialsId - The ID of the credential to update.
 * @param emailVerified - A boolean indicating whether the email is verified or not.
 */
export async function updateCredentialsTable(
  credentialsId: string,
  emailVerified?: boolean,
  hashedPassword?: string,
): Promise<void> {
  if (emailVerified) {
    await pool.query(
      `
            UPDATE credentials
            SET email_verified = $1
            WHERE id = $2
        `,
      [emailVerified, credentialsId],
    );
  } else if (hashedPassword) {
    await pool.query(
      `
        UPDATE credentials
        SET password_hash = $1
        WHERE id = $2
      `,
      [hashedPassword, credentialsId],
    );
  }
}
