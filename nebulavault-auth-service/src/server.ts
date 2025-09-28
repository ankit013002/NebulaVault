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
  const tokenEndpoint = wellKnown.token_endpoint as string;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT,
    code,
  });

  const tokens = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  }).then((r) => r.json());

  const idToken = tokens.id_token as string | undefined;
  if (!idToken) return res.status(400).send("no id_token");

  const wellKnownUrl = `${ISSUER_BASE}/.well-known/openid-configuration`;
  const meta = await fetch(wellKnownUrl).then((r) => r.json());
  const JWKS = createRemoteJWKSet(new URL(meta.jwks_uri));
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ISSUER_WITH_SLASH,
    audience: CLIENT_ID,
  });

  const email = String(payload.email ?? "");
  const name = String(payload.name ?? email);
  const vendorSub = String(payload.sub);
  const emailVerified = !!payload.email_verified;

  const c = await pool.connect();
  let userId: string,
    isNew = false;
  try {
    await c.query("BEGIN");
    const r = await c.query(
      `insert into users (email, name, email_verified, vendor_sub)
       values ($1,$2,$3,$4)
       on conflict (email) do update set
         name=excluded.name,
         vendor_sub=excluded.vendor_sub,
         email_verified = users.email_verified or excluded.email_verified
       returning id, (xmax = 0) as is_new`,
      [email, name, emailVerified, vendorSub]
    );
    userId = String(r.rows[0].id);
    isNew = !!r.rows[0].is_new;
    await c.query("COMMIT");
  } catch (e) {
    console.error("DB upsert error:", e);
    await c.query("ROLLBACK");
    return res.status(500).send("db error");
  } finally {
    c.release();
  }

  const access = jwt.sign(
    { sub: userId, email, roles: ["user"] },
    SIGNING_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "15m",
    }
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
