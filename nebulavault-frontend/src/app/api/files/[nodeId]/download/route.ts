import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns a short-lived storage URL. The bytes are fetched by the browser
 * directly from S3, so they never transit this server or the gateway.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;
  return proxyToGateway(`/files/${encodeURIComponent(nodeId)}/download?redirect=false`);
}
