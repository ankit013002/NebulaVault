import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reserves versions and returns presigned upload targets. */
export async function POST(req: NextRequest) {
  return proxyToGateway("/files/uploads", {
    method: "POST",
    body: await req.text(),
  });
}
