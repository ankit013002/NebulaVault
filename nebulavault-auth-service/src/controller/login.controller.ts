import { hashToken, makeOpaqueToken, signAccessToken } from "../lib/tokens";
import {
  createRefreshToken,
  retrieveCredentialsByEmail,
} from "../services/credentials.service";
import bcrypt from "bcrypt";

async function loginController(data: { email: string; password: string }) {
  const { email, password } = data;

  const credentials = await retrieveCredentialsByEmail(email);

  if (!credentials) {
    const error = new Error("Invalid credentials");
    error.name = "InvalidCredentialsError";
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    credentials.password_hash || "",
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid credentials");
    error.name = "InvalidCredentialsError";
    throw error;
  }

  const accessToken = signAccessToken(credentials.id, email);

  const rawRefreshToken = makeOpaqueToken();
  const hashedRefreshToken = hashToken(rawRefreshToken);

  await createRefreshToken(
    credentials.id,
    hashedRefreshToken,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    emailVerified: credentials.email_verified,
  };
}

export default loginController;
