import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Utility functions for token generation and hashing. This includes functions to sign JWT access tokens, create opaque refresh tokens, and hash tokens for secure storage. The signing secret is derived from the AUTH_SECRET environment variable, which can be a hex string or a UTF-8 string. The access tokens are signed with the HS256 algorithm and have a short expiration time for security.
 */
const SIGNING_SECRET = (() => {
  const RAW = (process.env.AUTH_SECRET || "dev-secret").trim();
  return /^[0-9a-f]{64}$/i.test(RAW)
    ? Buffer.from(RAW, "hex")
    : Buffer.from(RAW, "utf8");
})();

/**
 * Signs a JWT access token with the provided credential ID and email.
 * The token includes the credential ID as the subject (sub), the email, and a roles array with a default role of "user".
 * The token is signed using the HS256 algorithm and has an expiration time of 15 minutes.
 *
 * @param credentialId
 * @param email
 * @returns
 */
export function signAccessToken(credentialId: string, email: string): string {
  return jwt.sign(
    { sub: credentialId, email, roles: ["user"] },
    SIGNING_SECRET,
    { algorithm: "HS256", expiresIn: "15m" },
  );
}

/**
 * Generates an opaque refresh token.
 * @returns A randomly generated opaque token as a hexadecimal string.
 */
export function makeOpaqueToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

/**
 * Hashes a raw token using SHA-256 for secure storage in the database.
 * This ensures that even if the database is compromised, the actual token values are not exposed.
 *
 * @param raw
 * @returns A SHA-256 hash of the input token as a hexadecimal string.
 */
export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Creates both an access token and a refresh token for the given credential ID and email.
 * The access token is a JWT that can be used for authentication, while the refresh token
 * is an opaque token that can be used to obtain new access tokens when the current one expires.
 *
 * @param credentialId
 * @param email
 */
export function createAccessTokenAndRefreshToken(
  credentialId: string,
  email: string,
) {}
