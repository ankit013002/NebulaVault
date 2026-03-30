import { hashToken } from "../lib/tokens";
import { deleteRefreshTokenWithHash } from "../services/logout.service";

/**
 * Handles user logout by invalidating the provided refresh token.
 * If a refresh token is provided, it hashes the token and deletes the corresponding
 * entry from the database to ensure that it can no longer be used to obtain new access tokens.
 * If no refresh token is provided, the function simply returns without performing any action.
 *
 * @param data
 */
async function handleLogout(data: { refreshToken?: string }) {
  const refreshToken = data.refreshToken;
  if (refreshToken) {
    const hashedRefreshToken = hashToken(refreshToken);
    await deleteRefreshTokenWithHash(hashedRefreshToken);
  }
}

export default handleLogout;
