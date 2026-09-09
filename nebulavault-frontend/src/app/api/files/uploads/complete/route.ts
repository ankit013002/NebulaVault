import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Commits uploads once the browser has finished PUTting the bytes. */
export async function POST(req: NextRequest) {
  return proxyToGateway("/files/uploads/complete", {
    method: "POST",
    body: await req.text(),
  });
}
