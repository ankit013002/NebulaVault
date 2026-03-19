import jwt from "jsonwebtoken";
import crypto from "crypto";

const SIGNING_SECRET = (() => {
  const RAW = (process.env.AUTH_SECRET || "dev-secret").trim();
  return /^[0-9a-f]{64}$/i.test(RAW)
    ? Buffer.from(RAW, "hex")
    : Buffer.from(RAW, "utf8");
})();

export function signAccessToken(credentialId: string, email: string): string {
  return jwt.sign(
    { sub: credentialId, email, roles: ["user"] },
    SIGNING_SECRET,
    { algorithm: "HS256", expiresIn: "15m" }
  );
}

export function makeOpaqueToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
