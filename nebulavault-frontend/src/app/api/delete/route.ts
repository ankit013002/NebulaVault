import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Returns 501 for now so the route compiles but it's clearly unimplemented.
export async function DELETE() {
  return NextResponse.json(
    { ok: false, error: "Not implemented" },
    { status: 501 }
  );
}
