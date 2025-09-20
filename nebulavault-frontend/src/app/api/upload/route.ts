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
  } catch (e: any) {
    if (e?.code !== "EEXIST") throw e;
  }

  const now = new Date();
  await utimes(markerAbs, now, now);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const emptyFolders: string[] = [];

    for (const part of formData.getAll("folders")) {
      if (typeof part === "string") {
        emptyFolders.push(...JSON.parse(part));
      } else if (part instanceof File) {
        emptyFolders.push(...JSON.parse(await part.text()));
      }
    }
    const norm = (p: string) => {
      const s = p.replace(/\\/g, "/").replace(/^\/+/, "");
      return s && !s.endsWith("/") ? s + "/" : s;
    };
    const normalized = [...new Set(emptyFolders.map(norm))];

    for (const folder of normalized) {
      await touchFolderMarker(folder);
    }

    const fileParts = formData.getAll("files") as File[];
    const savedFiles: FileType[] = [];

    for (const file of fileParts) {
      const relName = file.name.replace(/^[/\\]+/, "").replace(/\\/g, "/");
      const absTarget = safeJoin(relName);
      await mkdir(dirname(absTarget), { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(absTarget, buffer);

      const lastSlash = relName.lastIndexOf("/");
      const dirPath = lastSlash >= 0 ? relName.slice(0, lastSlash + 1) : "";
      const baseName = lastSlash >= 0 ? relName.slice(lastSlash + 1) : relName;

      savedFiles.push({
        name: baseName,
        owner: "You",
        size: getNormalizedSize(file.size),
        type: file.type,
        lastModified: file.lastModified,
        path: dirPath,
      });
    }

    const db = await readDb();
    const updated = mergeByNameAndPath(db, savedFiles);
    await writeDb(updated);

    return NextResponse.json({
      ok: true,
      createdFolders: normalized,
      saved: savedFiles.map((f) => `${f.path}${f.name}`),
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { ok: false, error: e ?? "Upload failed" },
      { status: 400 }
    );
  }
}
