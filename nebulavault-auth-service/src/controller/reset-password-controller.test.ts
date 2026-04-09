import { describe, it, expect, vi, beforeEach } from "vitest";
import resetPassword from "./reset-password-controller";

// --- Mocks ---

vi.mock("../services/credentials.service", () => ({
  updateCredentialsTable: vi.fn(),
}));

vi.mock("../services/password-reset-token.service", () => ({
  getPasswordResetTokenByHashToken: vi.fn(),
  updatePasswordResetToken: vi.fn(),
}));

vi.mock("../services/refresh.service", () => ({
  deleteRefreshTokenWithCredentialId: vi.fn(),
}));

vi.mock("../lib/tokens", () => ({
  hashToken: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));

// --- Imports after mocks ---

import { updateCredentialsTable } from "../services/credentials.service";
import { getPasswordResetTokenByHashToken, updatePasswordResetToken } from "../services/password-reset-token.service";
import { deleteRefreshTokenWithCredentialId } from "../services/refresh.service";
import { hashToken } from "../lib/tokens";
import bcrypt from "bcrypt";

// --- Fixtures ---

const mockPasswordResetToken = {
  id: "prt-uuid-012",
  credential_id: "cred-uuid-123",
  token_hash: "hashed-reset-token",
  expires_at: new Date(Date.now() + 60 * 60 * 1000),
  used_at: null,
  created_at: new Date(),
};

// --- Tests ---

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws InvalidTokenError when the reset token is not found or expired", async () => {
    vi.mocked(hashToken).mockReturnValue("hashed-token");
    vi.mocked(getPasswordResetTokenByHashToken).mockResolvedValue(null);

    await expect(
      resetPassword({ token: "raw-token", newPassword: "newpassword123" }),
    ).rejects.toMatchObject({ name: "InvalidTokenError" });
  });

  it("hashes the new password and updates the credentials", async () => {
    vi.mocked(hashToken).mockReturnValue("hashed-token");
    vi.mocked(getPasswordResetTokenByHashToken).mockResolvedValue(mockPasswordResetToken);
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hashed-password" as never);
    vi.mocked(updateCredentialsTable).mockResolvedValue(undefined);
    vi.mocked(updatePasswordResetToken).mockResolvedValue(undefined);
    vi.mocked(deleteRefreshTokenWithCredentialId).mockResolvedValue(undefined);

    await resetPassword({ token: "raw-token", newPassword: "newpassword123" });

    expect(updateCredentialsTable).toHaveBeenCalledWith(
      mockPasswordResetToken.credential_id,
      undefined,
      "new-hashed-password",
    );
  });

  it("marks the reset token as used so it cannot be reused", async () => {
    vi.mocked(hashToken).mockReturnValue("hashed-token");
    vi.mocked(getPasswordResetTokenByHashToken).mockResolvedValue(mockPasswordResetToken);
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hashed-password" as never);
    vi.mocked(updateCredentialsTable).mockResolvedValue(undefined);
    vi.mocked(updatePasswordResetToken).mockResolvedValue(undefined);
    vi.mocked(deleteRefreshTokenWithCredentialId).mockResolvedValue(undefined);

    await resetPassword({ token: "raw-token", newPassword: "newpassword123" });

    expect(updatePasswordResetToken).toHaveBeenCalledWith("hashed-token");
  });

  it("invalidates all active sessions after a password reset", async () => {
    vi.mocked(hashToken).mockReturnValue("hashed-token");
    vi.mocked(getPasswordResetTokenByHashToken).mockResolvedValue(mockPasswordResetToken);
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hashed-password" as never);
    vi.mocked(updateCredentialsTable).mockResolvedValue(undefined);
    vi.mocked(updatePasswordResetToken).mockResolvedValue(undefined);
    vi.mocked(deleteRefreshTokenWithCredentialId).mockResolvedValue(undefined);

    await resetPassword({ token: "raw-token", newPassword: "newpassword123" });

    expect(deleteRefreshTokenWithCredentialId).toHaveBeenCalledWith(mockPasswordResetToken.credential_id);
  });
});
