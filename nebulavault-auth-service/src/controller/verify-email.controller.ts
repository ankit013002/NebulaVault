import { hashToken } from "../lib/tokens";
import {
  deleteVerificationTokenByTokenHash,
  getVerificationTokenEntryByTokenHash,
} from "../services/email-verification-token";
import { updateCredentialsTable } from "../services/credentials.service";

/**
 * Handles email verification by validating the provided token, updating the user's email verification status,
 * and cleaning up the verification token from the database. If the token is missing, invalid, or expired,
 * it throws an appropriate error to indicate the failure of the email verification process.
 *
 * @param token - The email verification token provided by the user, typically received as a query parameter in the verification link.
 * @throws {MissingTokenError} If the verification token is not provided in the request.
 * @throws {InvalidTokenError} If the provided token is invalid or does not exist in the database.
 */
export async function handleVerifyEmail(
  token: string | unknown | undefined,
): Promise<void> {
  if (!token || typeof token !== "string") {
    const error = new Error("Verification token is required");
    error.name = "MissingTokenError";
    throw error;
  }

  const hashedToken = hashToken(token);

  const emailVerificationsToken =
    await getVerificationTokenEntryByTokenHash(hashedToken);

  if (!emailVerificationsToken) {
    const error = new Error("Invalid or expired verification token");
    error.name = "InvalidTokenError";
    throw error;
  }

  const credentialId = emailVerificationsToken.credential_id;

  await updateCredentialsTable(credentialId, true);

  await deleteVerificationTokenByTokenHash(hashedToken);
}
