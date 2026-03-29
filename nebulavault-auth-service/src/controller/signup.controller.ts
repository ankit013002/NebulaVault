import { sendVerificationEmail } from "../lib/mailer";
import { hashToken, makeOpaqueToken, signAccessToken } from "../lib/tokens";
import {
  createRefreshToken,
  createVerficationToken,
  retrieveCredentialsByEmail,
} from "../services/credentials.service";
import { createCredentials } from "../services/signup.service";
import bcrypt from "bcrypt";

/**
 * Creates a new user account, sends a verification email, and returns the access and refresh tokens.
 *
 * @param data
 * @returns
 */
async function createUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  const { email, password, name } = data;

  const credentialsExist = await retrieveCredentialsByEmail(email);

  if (credentialsExist) {
    const error = new Error("User with this email already exists");
    error.name = "UserExistsError";
    throw error;
  }

  const saltRounds = 12;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const credentials = await createCredentials(email, hashedPassword, name);

  const rawToken = makeOpaqueToken();

  const hashedToken = hashToken(rawToken);

  await createVerficationToken(credentials.id, hashedToken);

  await sendVerificationEmail(email, rawToken);

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
  };
}

export default createUser;
