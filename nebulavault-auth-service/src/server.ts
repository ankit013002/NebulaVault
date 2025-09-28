import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import jwt from "jsonwebtoken";
import pool from "./db";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = Number(process.env.PORT) || 4000;

const RAW_ISSUER = process.env.OIDC_ISSUER!;
const ISSUER_BASE = RAW_ISSUER.replace(/\/+$/, "");
const ISSUER_WITH_SLASH = `${ISSUER_BASE}/`;

const CLIENT_ID = process.env.OIDC_CLIENT_ID!;
const CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET!;
const REDIRECT = process.env.OIDC_REDIRECT_URI!;
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";
const RAW = (process.env.AUTH_SECRET || "dev-secret").trim();
const SIGNING_SECRET = /^[0-9a-f]{64}$/i.test(RAW)
  ? Buffer.from(RAW, "hex")
  : Buffer.from(RAW, "utf8");

app.get("/api/auth/oidc/start", (req, res) => {
  const authz = new URL(`${ISSUER_BASE}/authorize`);
  authz.searchParams.set("response_type", "code");
  authz.searchParams.set("client_id", CLIENT_ID);
  authz.searchParams.set("redirect_uri", REDIRECT);
  authz.searchParams.set("scope", "openid email profile");
  authz.searchParams.set("prompt", "login");
  authz.searchParams.set("screen_hint", "signup");
  authz.searchParams.set("connection", "NebulaVaultNeonDB");

  console.log(authz);

  const screen_hint =
    typeof req.query.screen_hint === "string"
      ? req.query.screen_hint
      : "signup";
  authz.searchParams.set("screen_hint", screen_hint);

  const login_hint =
    typeof req.query.login_hint === "string" ? req.query.login_hint : undefined;
  if (login_hint) authz.searchParams.set("login_hint", login_hint);

  return res.redirect(authz.toString());
});

app.get("/api/auth/oidc/callback", async (req, res) => {
  const code = String(req.query.code || "");
  if (!code) return res.status(400).send("missing code");

  const wellKnown = await fetch(
    `${ISSUER_BASE}/.well-known/openid-configuration`
  ).then((r) => r.json());

  const tokens = await fetch(wellKnown.token_endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT,
      code,
    }),
  }).then((r) => r.json());

  const idToken = tokens.id_token as string | undefined;
  if (!idToken) return res.status(400).send("no id_token");

  const JWKS = createRemoteJWKSet(new URL(wellKnown.jwks_uri));
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ISSUER_WITH_SLASH,
    audience: CLIENT_ID,
  });

  const email = String(payload.email ?? "");
  const emailVerified = !!payload.email_verified;
  const userSub = String(payload.sub);

  const c = await pool.connect();
  let isNew = false;
  try {
    await c.query("BEGIN");
    const r = await c.query(
      `INSERT INTO profiles (user_sub, email, email_verified)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_sub) DO UPDATE
         SET email = EXCLUDED.email,
             email_verified = profiles.email_verified OR EXCLUDED.email_verified
       RETURNING (xmax = 0) AS is_new`,
      [userSub, email, emailVerified]
    );
    isNew = !!r.rows[0]?.is_new;
    await c.query("COMMIT");
  } catch (e) {
    console.error("DB upsert error:", e);
    await c.query("ROLLBACK");
    return res.status(500).send("db error");
  } finally {
    c.release();
  }

  const access = jwt.sign(
    { sub: userSub, email, roles: ["user"], isNew },
    SIGNING_SECRET,
    { algorithm: "HS256", expiresIn: "15m" }
  );

  res.cookie("session", access, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  return res.redirect(`${APP_ORIGIN}/dashboard`);
});

app.post("/api/login", (req: Request, res: Response) => {
  console.log("HIT");
  res.json({ youSent: req.body });
});

app.use((req: Request, res: Response) =>
  res.status(404).json({ error: "Not found" })
);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
