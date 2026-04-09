import pool from "../db";
import { PasswordResetToken } from "../types/database";

/**
 * Deletes all password reset tokens from the database associated with the provided credential ID.
 * This is called before creating a new reset token to ensure only one active token exists per user.
 *
 * @param credentialId - The ID of the credential whose password reset tokens should be deleted.
 */
export async function deletePasswordResetToken(
  credentialId: string,
): Promise<void> {
  await pool.query(
    `
      DELETE FROM password_reset_tokens
      WHERE credential_id = $1
    `,
    [credentialId],
  );
}

/**
 * Creates a new password reset token for the specified credential ID and token hash.
 * The token expires 1 hour from the time of creation.
 *
 * @param credentialId - The ID of the credential for which the password reset token is being created.
 * @param tokenHash - The hash of the reset token to be stored in the database for later verification.
 */
export async function createPasswordResetToken(
  credentialId: string,
  tokenHash: string,
): Promise<void> {
  await pool.query(
    `
      INSERT INTO password_reset_tokens (credential_id, token_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '1 hour')
    `,
    [credentialId, tokenHash],
  );
}

/**
 * Retrieves a password reset token entry from the database based on the provided token hash.
 *
 * @param token_hash - The hash of the reset token used to look up the corresponding entry in the database.
 * @returns A promise resolving to the password reset token entry if found, valid, and unused, or null otherwise.
 */
export async function getPasswordResetTokenByHashToken(
  token_hash: string,
): Promise<PasswordResetToken | null> {
  const result = await pool.query(
    `
      SELECT * FROM password_reset_tokens
      WHERE token_hash = $1 and expires_at >$2 and used_at IS NULL
    `,
    [token_hash, new Date()],
  );

  return result.rows[0];
}

/**
 * Marks a password reset token as used by setting its used_at timestamp to the current time.
 * This prevents the token from being used again after a successful password reset.
 *
 * @param token_hash - The hash of the reset token to be marked as used.
 */
export async function updatePasswordResetToken(
  token_hash: string,
): Promise<void> {
  await pool.query(
    `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE token_hash = $1
    `,
    [token_hash],
  );
}
