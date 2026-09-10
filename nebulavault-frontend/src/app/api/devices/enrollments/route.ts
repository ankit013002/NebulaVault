import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Devices waiting for the user to approve their pairing code. */
export async function GET() {
  return proxyToGateway("/devices/enrollments/pending/list");
}

/** Approve or reject a pairing code. */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    action?: string;
    code?: string;
    allocatedBytes?: number;
  };

  const path =
    body.action === "reject"
      ? "/devices/enrollments/reject"
      : "/devices/enrollments/approve";

  return proxyToGateway(path, {
    method: "POST",
    body: JSON.stringify(
      body.action === "reject"
        ? { code: body.code }
        : { code: body.code, allocatedBytes: body.allocatedBytes }
    ),
  });
}
