import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vault-wide protection state, reported as the worst across objects. */
export async function GET() {
  return proxyToGateway("/placement/protection");
}
