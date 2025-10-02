export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const upstream = await fetch("http://localhost:8080/files/head", {
    method: "POST",
    headers: { "content-type": "application/json" },
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
