import { describe, it, expect, vi } from "vitest";
import { setAuthCookies, clearAuthCookies } from "./cookies";
import { Response } from "express";

const createMockResponse = () =>
  ({
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  }) as unknown as Response;

describe("setAuthCookies", () => {
  it("sets the session cookie with the access token", () => {
    const res = createMockResponse();
    setAuthCookies(res, "access-token", "refresh-token");

    expect(res.cookie).toHaveBeenCalledWith(
      "session",
      "access-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      }),
    );
  });

  it("sets the refresh_token cookie with the refresh token", () => {
    const res = createMockResponse();
    setAuthCookies(res, "access-token", "refresh-token");

    expect(res.cookie).toHaveBeenCalledWith(
      "refresh_token",
      "refresh-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
  });

  it("calls res.cookie exactly twice", () => {
    const res = createMockResponse();
    setAuthCookies(res, "access-token", "refresh-token");
    expect(res.cookie).toHaveBeenCalledTimes(2);
  });
});

describe("clearAuthCookies", () => {
  it("clears the session cookie", () => {
    const res = createMockResponse();
    clearAuthCookies(res);
    expect(res.clearCookie).toHaveBeenCalledWith("session", expect.any(Object));
  });

  it("clears the refresh_token cookie", () => {
    const res = createMockResponse();
    clearAuthCookies(res);
    expect(res.clearCookie).toHaveBeenCalledWith(
      "refresh_token",
      expect.any(Object),
    );
  });

  it("calls res.clearCookie exactly twice", () => {
    const res = createMockResponse();
    clearAuthCookies(res);
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
  });
});
