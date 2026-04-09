import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleVerifyEmail } from "./verify-email.controller";

// --- Mocks ---

vi.mock("../services/email-verification-token", () => ({
  getVerificationTokenEntryByTokenHash: vi.fn(),
  deleteVerificationTokenByTokenHash: vi.fn(),
}));

vi.mock("../services/credentials.service", () => ({
  updateCredentialsTable: vi.fn(),
}));

vi.mock("../lib/tokens", () => ({
  hashToken: vi.fn(),
}));

// --- Imports after mocks ---

import { getVerificationTokenEntryByTokenHash, deleteVerificationTokenByTokenHash } from "../services/email-verification-token";
import { updateCredentialsTable } from "../services/credentials.service";
import { hashToken } from "../lib/tokens";

// --- Fixtures ---

const mockVerificationTokenEntry = {
  id: "evt-uuid-789",
  credential_id: "cred-uuid-123",
  token_hash: "hashed-verification-token",
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  created_at: new Date(),
};

// --- Tests ---

describe("handleVerifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws MissingTokenError when no token is provided", async () => {
    await expect(handleVerifyEmail(undefined)).rejects.toMatchObject({
      name: "MissingTokenError",
    });
  });

  it("throws MissingTokenError when token is not a string", async () => {
    await expect(handleVerifyEmail(12345)).rejects.toMatchObject({
      name: "MissingTokenError",
    });
  });

  it("throws InvalidTokenError when the token is not found in the database", async () => {
    vi.mocked(hashToken).mockReturnValue("hashed-token");
    vi.mocked(getVerificationTokenEntryByTokenHash).mockResolvedValue(null);

    await expect(handleVerifyEmail("raw-token")).rejects.toMatchObject({
      name: "InvalidTokenError",
    });
  });

  it("marks the email as verified and deletes the token on success", async () => {
    vi.mocked(hashToken).mockReturnValue("hashed-token");
    vi.mocked(getVerificationTokenEntryByTokenHash).mockResolvedValue(mockVerificationTokenEntry);
    vi.mocked(updateCredentialsTable).mockResolvedValue(undefined);
    vi.mocked(deleteVerificationTokenByTokenHash).mockResolvedValue(undefined);

    await handleVerifyEmail("raw-token");

    expect(updateCredentialsTable).toHaveBeenCalledWith("cred-uuid-123", true);
    expect(deleteVerificationTokenByTokenHash).toHaveBeenCalledWith("hashed-token");
  });

  it("deletes the token after verifying so it cannot be reused", async () => {
    vi.mocked(hashToken).mockReturnValue("hashed-token");
    vi.mocked(getVerificationTokenEntryByTokenHash).mockResolvedValue(mockVerificationTokenEntry);
    vi.mocked(updateCredentialsTable).mockResolvedValue(undefined);
    vi.mocked(deleteVerificationTokenByTokenHash).mockResolvedValue(undefined);

    await handleVerifyEmail("raw-token");

    expect(deleteVerificationTokenByTokenHash).toHaveBeenCalledTimes(1);
  });
});
