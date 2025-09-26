"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { z } from "zod";
import { loginSchema } from "../schemas/UserLoginSchema";
import { ActionState } from "@/types/AuthActionState";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret"
);

export type Session = JWTPayload & {
  sub: string;
  email: string;
  role?: string;
  sid: string;
};

export async function signSession(
  payload: Omit<Session, "iat" | "exp">,
  exp = "15m"
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret);
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload as Session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string, maxAgeSec = 60 * 15) {
  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set("session", "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  return await verifySession(token);
}

export async function login(_prevState: ActionState, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      errors: {
        general: "Invalid email or password",
      },
    };
  }

  const res = await fetch(`${process.env.GATEWAY_ORIGIN}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  const data = await res.json();

  console.log(data);

  if (!res.ok) {
    console.log("ERROR HITTING GATEWAY");
  }
}

export async function logout(_prevState: ActionState, formData: FormData) {}
