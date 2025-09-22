import { FileType } from "@/types/File";
import { readDb, writeDb } from "@/utils/FileDb";
import { getNormalizedSize } from "@/utils/NormalizedSize";
import { mkdir, writeFile, utimes } from "fs/promises";
import { NextResponse } from "next/server";
import path, { dirname } from "path";

export const runtime = "nodejs";

const UPLOAD_ROOT =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const ROOT_RESOLVED = path.resolve(UPLOAD_ROOT);

function safeJoin(relPath: string) {
  const clean = relPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const abs = path.resolve(ROOT_RESOLVED, clean);
  const rel = path.relative(ROOT_RESOLVED, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel))
    throw new Error("Invalid path");
  return abs;
}

function mergeByNameAndPath(existing: FileType[], incoming: FileType[]) {
  const key = (x: FileType) => `${x.path}::${x.name}`;
  const map = new Map(existing.map((x) => [key(x), x]));
  for (const f of incoming) map.set(key(f), f);
  return Array.from(map.values());
}

async function touchFolderMarker(relFolder: string) {
  const absDir = safeJoin(relFolder);
  await mkdir(absDir, { recursive: true });

  const markerAbs = path.join(absDir, ".folder");

  try {
    await writeFile(markerAbs, new Uint8Array(), { flag: "wx" });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e);
    }
  }

  const now = new Date();
  await utimes(markerAbs, now, now);
}

export async function POST(req: Request) {
  const body = await req.text();
  const upstream = await fetch("http://localhost:8080/files", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
