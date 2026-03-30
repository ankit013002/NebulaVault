import { Response } from "express";

/**
 * Common cookie options for authentication cookies.
 * - httpOnly: true to prevent client-side JavaScript from accessing the cookies.
 * - sameSite: "lax" to allow cookies to be sent with top-level navigations and GET requests initiated by third-party websites.
 * - secure: true in production to ensure cookies are only sent over HTTPS.
 */
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
