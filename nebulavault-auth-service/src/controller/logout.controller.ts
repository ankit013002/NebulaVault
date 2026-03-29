import { hashToken } from "../lib/tokens";
import { deleteRefreshToken } from "../services/logout.service";

async function handleLogout(data: { refreshToken: string }) {
  const refreshToken = data.refreshToken;
  if (refreshToken) {
    const hashedRefreshToken = hashToken(refreshToken);
    await deleteRefreshToken(hashedRefreshToken);
  }
}

export default handleLogout;
