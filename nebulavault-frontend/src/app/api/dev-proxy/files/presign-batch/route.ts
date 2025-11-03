import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const cookieHeader = (await cookies()).toString();

  const upstream = await fetch("http://localhost:8080/drive-nodes", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieHeader },
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
