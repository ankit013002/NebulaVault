import { readDb } from "@/utils/FileDb";
import { NextResponse } from "next/server";
import path from "path";
import { readdir } from "fs/promises";

export const runtime = "nodejs";

const UPLOAD_ROOT =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const ROOT_RESOLVED = path.resolve(UPLOAD_ROOT);

function normalizePathParam(p?: string | null) {
  let s = (p ?? "").replace(/\\/g, "/");
  if (s.startsWith("/")) s = s.slice(1);
  if (s !== "" && !s.endsWith("/")) s += "/";
  return s;
}

function safeResolve(rel: string) {
  const abs = path.resolve(ROOT_RESOLVED, rel);
  const relBack = path.relative(ROOT_RESOLVED, abs);
  if (relBack.startsWith("..") || path.isAbsolute(relBack)) {
    throw new Error("Invalid path");
  }
  return abs;
}

async function listImmediateSubdirs(relPath: string): Promise<string[]> {
  const abs = safeResolve(relPath);
  try {
    const entries = await readdir(abs, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name + "/");
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pathParam = normalizePathParam(url.searchParams.get("path"));

  const all = await readDb();

  const folderSet = new Set<string>();
  const files = all.filter((f) => (f.path ?? "") === pathParam);
  for (const f of all) {
    const p = f.path ?? "";
    if (!p.startsWith(pathParam)) continue;
    const rest = p.slice(pathParam.length);
    const seg = rest.split("/").filter(Boolean)[0];
    if (seg) folderSet.add(seg + "/");
  }

  const diskSubs = await listImmediateSubdirs(pathParam);
  diskSubs.forEach((d) => folderSet.add(d));

  return NextResponse.json({
    ok: true,
    path: pathParam,
    folders: Array.from(folderSet).sort(),
    files,
  });
}
