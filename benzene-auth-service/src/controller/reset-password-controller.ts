import { resetPasswordSchema } from "../lib/schema";
import { hashToken } from "../lib/tokens";
import { updatePassword } from "../services/credentials.service";
import {
  getPasswordResetTokenByHashToken,
  updatePasswordResetToken,
} from "../services/password-reset-token.service";
import bcrypt from "bcrypt";
import { deleteRefreshTokenWithCredentialId } from "../services/refresh.service";

async function resetPassword(data: { token: string; newPassword: string }) {
  const { token, newPassword } = resetPasswordSchema.parse(data);

  const hashedParsedToken = hashToken(token);

  const passwordResetToken =
    await getPasswordResetTokenByHashToken(hashedParsedToken);

  if (!passwordResetToken) {
    const error = new Error("Invalid or expired reset link");
    error.name = "InvalidTokenError";
    throw error;
  }

  const credentialId = passwordResetToken.credential_id;

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await updatePassword(credentialId, hashedPassword);

  await updatePasswordResetToken(hashedParsedToken);

  await deleteRefreshTokenWithCredentialId(credentialId);
}

export default resetPassword;
