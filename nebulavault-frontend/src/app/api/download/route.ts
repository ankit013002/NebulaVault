import path from "path";
import { stat } from "fs/promises";
import { safeResolve } from "@/utils/pathUtils";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { lookup } from "mime-types";

export const runtime = "nodejs";

function cleanRel(p?: string | null) {
  return (p ?? "").replace(/\\/g, "/").replace(/^\/+/, "");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filePath = cleanRel(url.searchParams.get("path"));

  if (!filePath) {
    return new Response(JSON.stringify({ ok: false, error: "Missing path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let abs: string;
  try {
    abs = safeResolve(filePath);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let st;
  try {
    st = await stat(abs);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!st.isFile()) {
    return new Response(JSON.stringify({ ok: false, error: "Not a file" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fileName = path.basename(abs);

  let contentType = "application/octet-stream";
  try {
    contentType = lookup(fileName) || "application/octet-stream";
  } catch (e) {
    console.log(e);
  }

  const nodeStream = createReadStream(abs);
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": String(contentType),
      "Content-Length": st.size.toString(),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        fileName
      )}; filename="${fileName.replace(/"/g, '\\"')}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
