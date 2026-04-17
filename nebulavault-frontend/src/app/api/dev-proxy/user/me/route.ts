import { cookies } from "next/headers";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "No session" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const upstream = await fetch(`${process.env.GATEWAY_ORIGIN}/user/me`, {
    method: "GET",
    cache: "no-store",
    headers: {
      cookie: `session=${session}`,
      "content-type": "application/json",
    },
  });

  return new Response(upstream.body, {
    status: upstream.status,
  });
}
