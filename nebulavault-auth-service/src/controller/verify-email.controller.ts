import { hashToken } from "../lib/tokens";
import {
  deleteVerificationTokenByTokenHash,
  getVerificationTokenEntryByTokenHash,
} from "../services/email-verification-token";
import { updateCredentialsTable } from "../services/credentials.service";

export async function handleVerifyEmail(token: string | unknown | undefined) {
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
