import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Devices holding an object, each with read authorisation. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ objectHash: string }> }
) {
  const { objectHash } = await params;
  return proxyToGateway(
    `/placement/download-targets/${encodeURIComponent(objectHash)}`
  );
}
