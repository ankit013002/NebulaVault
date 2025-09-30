import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const RAW = (process.env.AUTH_SECRET ?? "").trim();
const secret = /^[0-9a-f]{64}$/i.test(RAW)
  ? Uint8Array.from(RAW.match(/.{2}/g)!.map((h) => parseInt(h, 16)))
  : new TextEncoder().encode(RAW);

const isPublic = (p: string) =>
  p === "/" ||
  p === "/login" ||
  p === "/register" ||
  p === "/favicon.ico" ||
  p.startsWith("/auth") ||
  p.startsWith("/_next") ||
  p.startsWith("/static") ||
  p.startsWith("/api/public");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    if (pathname === "/") {
      const token = req.cookies.get("session")?.value;
      if (token) {
        try {
          await jwtVerify(token, secret, { algorithms: ["HS256"] });
          return NextResponse.redirect(new URL("/dashboard", req.url));
        } catch {}
      }
    }
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url)
    );
    res.cookies.delete("session");
    return res;
  }
}

export const config = { matcher: ["/:path*"] };
