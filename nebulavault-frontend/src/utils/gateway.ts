import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Origin of the Spring Cloud Gateway. Read per request rather than at module
 * load so a build never bakes in a deploy-time value.
 */
export function gatewayOrigin(): string {
  const origin = process.env.GATEWAY_ORIGIN ?? process.env.NEXT_PUBLIC_GATEWAY_ORIGIN;
  if (!origin) {
    throw new Error("GATEWAY_ORIGIN is not configured");
  }
  return origin.replace(/\/+$/, "");
}

interface ProxyOptions {
  method?: string;
  body?: BodyInit | null;
  /** Follow redirects instead of passing them back to the browser. */
  redirect?: RequestRedirect;
}

/**
 * Forwards a request to the gateway with the caller's session cookie attached.
 *
 * The browser never talks to the gateway directly, so this is the single place
 * that decides what crosses that boundary.
 */
export async function proxyToGateway(
  path: string,
  options: ProxyOptions = {}
): Promise<NextResponse> {
  const cookieHeader = (await cookies()).toString();

  const upstream = await fetch(`${gatewayOrigin()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      cookie: cookieHeader,
    },
    ...(options.body !== undefined ? { body: options.body } : {}),
    redirect: options.redirect ?? "manual",
    cache: "no-store",
  });

  // A redirect from the download endpoint points at a presigned storage URL.
  // Hand the location back as JSON so the client can navigate to it itself,
  // rather than having Next follow it and stream the bytes through this server.
  const location = upstream.headers.get("location");
  if (location && upstream.status >= 300 && upstream.status < 400) {
    return NextResponse.json({ data: { url: location } }, { status: 200 });
  }

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") ?? "application/json";

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": contentType },
  });
}
