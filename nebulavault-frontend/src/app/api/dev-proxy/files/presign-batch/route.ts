import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const cookieHeader = (await cookies()).toString();

  const upstream = await fetch("http://localhost:8080/drive-nodes", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieHeader },
    body,
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(req: NextRequest) {
  const path = await req.nextUrl.searchParams.get("path");
  console.log(path);
  const cookieHeader = (await cookies()).toString();

  const upstream = await fetch(
    `http://localhost:8080/drive-nodes?path=${path}`,
    {
      method: "GET",
      headers: { "content-type": "application/json", cookie: cookieHeader },
    }
  );

  const upstreamJson = await upstream.json();
  console.log("DATA: ", upstreamJson);

  return NextResponse.json(upstreamJson, {
    status: 200,
  });
}
