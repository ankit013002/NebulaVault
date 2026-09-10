import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return proxyToGateway("/devices");
}
