import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;
  const purge = req.nextUrl.searchParams.get("purge") === "true";
  return proxyToGateway(
    `/drive-nodes/${encodeURIComponent(nodeId)}?purge=${purge}`,
    { method: "DELETE" }
  );
}
