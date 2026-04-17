import pool from "../db";
import { EmailVerificationToken } from "../types/database";

/**
 * Creates a new email verification token for the specified credential ID and token hash.
 *
 * @param credentialId - The ID of the credential for which the verification token is being created.
 * @param tokenHash - The hash of the verification token to be stored in the database for later verification.
 */
export async function createVerificationToken(
  credentialId: string,
  tokenHash: string,
): Promise<void> {
  await pool.query(
    `
        INSERT INTO email_verification_tokens (credential_id, token_hash, expires_at)
        values ($1, $2, $3)  
    `,
    [credentialId, tokenHash, new Date(Date.now() + 24 * 60 * 60 * 1000)],
  );
}
/**
 * Retrieves an email verification token entry from the database based on the provided token hash.
 *
 * @param token_hash - The hash of the verification token used to look up the corresponding entry in the database.
 * @returns A promise resolving to the email verification token entry if found and valid, or null if not found or expired.
 */
export async function getVerificationTokenEntryByTokenHash(
  token_hash: string,
): Promise<EmailVerificationToken | null> {
  const result = await pool.query(
    `
        SELECT * FROM email_verification_tokens
        WHERE token_hash = $1 and expires_at > $2
    `,
    [token_hash, new Date()],
  );

  return result.rows[0];
}

/**
 * Deletes an email verification token from the database based on the provided token hash.
 *
 * @param token_hash - The hash of the verification token to be deleted from the database.
 */
export async function deleteVerificationTokenByTokenHash(
  token_hash: string,
): Promise<void> {
  await pool.query(
    `
      DELETE FROM email_verification_tokens
      WHERE token_hash = $1
    `,
    [token_hash],
  );
}

/**
 * Deletes all email verification tokens associated with a specific credential ID from the database.
 *
 * @param credentialId - The ID of the credential for which all associated email verification tokens should be deleted from the database.
 */
export async function deleteEmailVerificationTokensByCredentialId(
  credentialId: string,
) {
  await pool.query(
    `
      DELETE FROM email_verification_tokens
      WHERE credential_id = $1
    `,
    [credentialId],
  );
}
