import { NextRequest } from "next/server";

import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Change how much storage a device contributes. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  return proxyToGateway(`/devices/${encodeURIComponent(deviceId)}/allocation`, {
    method: "PATCH",
    body: await req.text(),
  });
}

/** Begin retiring a device. Data must drain before it can leave. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  return proxyToGateway(`/devices/${encodeURIComponent(deviceId)}/removal`, {
    method: "POST",
  });
}
