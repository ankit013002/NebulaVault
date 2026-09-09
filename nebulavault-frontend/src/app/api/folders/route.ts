import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Creates folders that contain no files, which uploads alone would not make. */
export async function POST(req: NextRequest) {
  return proxyToGateway("/folders", {
    method: "POST",
    body: await req.text(),
  });
}
