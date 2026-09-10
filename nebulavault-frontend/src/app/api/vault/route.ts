import { proxyToGateway } from "@/utils/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vault capacity, device counts and usage. */
export async function GET() {
  return proxyToGateway("/vaults/me");
}
