import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Records that a device accepted the bytes, promoting the replica to healthy. */
export async function POST(req: NextRequest) {
  return proxyToGateway("/placement/confirm", {
    method: "POST",
    body: await req.text(),
  });
}
