export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "No session" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // const upstream = await fetch(
  //   `${
  //     process.env.GATEWAY_ORIGIN ?? process.env.NEXT_PUBLIC_GATEWAY_ORIGIN
  //   }/user/bootstrap`,
  //   {
  //     method: "POST",
  //     cache: "no-store",
  //     headers: {
  //       cookie: `session=${session}`, // <-- critical for gateway auth
  //       "content-type": "application/json",
  //     },
  //   }
  // );

  // return new Response(upstream.body, {
  //   status: upstream.status,
  //   headers: {
  //     "content-type":
  //       upstream.headers.get("content-type") ?? "application/json",
  //   },
  // });
  if (session) {
    return new NextResponse(null, { status: 200 });
  } else {
    return new NextResponse(null, { status: 500 });
  }
}
