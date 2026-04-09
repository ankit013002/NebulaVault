import { describe, it, expect, vi, beforeEach } from "vitest";
import handleLogout from "./logout.controller";

// --- Mocks ---

vi.mock("../services/refresh.service", () => ({
  deleteRefreshTokenWithHash: vi.fn(),
}));

vi.mock("../lib/tokens", () => ({
  hashToken: vi.fn(),
}));

// --- Imports after mocks ---

import { deleteRefreshTokenWithHash } from "../services/refresh.service";
import { hashToken } from "../lib/tokens";

// --- Tests ---

describe("handleLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hashes the refresh token and deletes it from the database", async () => {
    vi.mocked(hashToken).mockReturnValue("hashed-refresh-token");
    vi.mocked(deleteRefreshTokenWithHash).mockResolvedValue(undefined);

    await handleLogout({ refreshToken: "raw-refresh-token" });

    expect(hashToken).toHaveBeenCalledWith("raw-refresh-token");
    expect(deleteRefreshTokenWithHash).toHaveBeenCalledWith("hashed-refresh-token");
  });

  it("does nothing when no refresh token is provided", async () => {
    await handleLogout({});

    expect(hashToken).not.toHaveBeenCalled();
    expect(deleteRefreshTokenWithHash).not.toHaveBeenCalled();
  });

  it("does not throw even when no token is provided", async () => {
    await expect(handleLogout({})).resolves.toBeUndefined();
  });
});
