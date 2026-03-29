import { Response } from "express";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/**
 * Sets the authentication cookies for the user.
 *
 * @param res
 * @param accessToken
 * @param refreshToken
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie("session", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refresh_token", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clears the authentication cookies for the user.
 *
 * @param res
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie("session", { ...COOKIE_OPTIONS });
  res.clearCookie("refresh_token", { ...COOKIE_OPTIONS });
}
