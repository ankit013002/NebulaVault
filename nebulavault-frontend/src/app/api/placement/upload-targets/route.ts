import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Where an object should be stored, and with what authority. */
export async function POST(req: NextRequest) {
  return proxyToGateway("/placement/upload-targets", {
    method: "POST",
    body: await req.text(),
  });
}
