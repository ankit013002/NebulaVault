import { readDb } from "@/utils/FileDb";
import { NextResponse } from "next/server";
import path from "path";
import { readdir, stat } from "fs/promises";
import { FolderType } from "@/types/Folder";
import { FileType } from "@/types/File";
import { getNormalizedSize } from "@/utils/NormalizedSize";

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

function aggregateFolderFromFiles(folderFullPath: string, all: FileType[]) {
  const descendants = all.filter((f) =>
    (f.path ?? "").startsWith(folderFullPath)
  );

  const sizeRaw = descendants.reduce((sum, f) => sum + (f.size?.raw ?? 0), 0);

  let lastModified = 0;
  let owner = "You";
  if (descendants.length) {
    const latest = descendants.reduce((a, b) =>
      (a.lastModified ?? 0) >= (b.lastModified ?? 0) ? a : b
    );
    lastModified = latest.lastModified ?? 0;
    owner = latest.owner ?? "You";
  }

  return { sizeRaw, lastModified, owner };
}

async function computeFolderInfo(
  folderName: string,
  parentPath: string,
  all: FileType[]
): Promise<FolderType> {
  const folderFull = parentPath + folderName;
  const folderAbs = safeResolve(folderFull);
  const markerAbs = path.join(folderAbs, ".folder");

  const {
    sizeRaw,
    lastModified: fromFiles,
    owner,
  } = aggregateFolderFromFiles(folderFull, all);

  let finalLastModified = fromFiles;

  if (!finalLastModified) {
    try {
      const mst = await stat(markerAbs);
      finalLastModified = mst.mtimeMs || mst.birthtimeMs || 0;
    } catch {}

    if (!finalLastModified) {
      try {
        const st = await stat(folderAbs);
        finalLastModified = st.mtimeMs || st.birthtimeMs || 0;
      } catch {
        finalLastModified = Date.now();
      }
    }
  }

  return {
    name: folderName,
    path: parentPath,
    owner,
    size: getNormalizedSize(sizeRaw),
    lastModified: finalLastModified,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pathParam = normalizePathParam(url.searchParams.get("path"));

  const all = await readDb();

  const files = all.filter((f) => (f.path ?? "") === pathParam);

  const folderSet = new Set<string>();

  for (const f of all) {
    const p = f.path ?? "";
    if (!p.startsWith(pathParam)) continue;
    const rest = p.slice(pathParam.length);
    const seg = rest.split("/").filter(Boolean)[0];
    if (seg) folderSet.add(seg + "/");
  }

  const diskSubs = await listImmediateSubdirs(pathParam);
  diskSubs.forEach((d) => folderSet.add(d));

  const folderNames = Array.from(folderSet).sort();
  const folders = await Promise.all(
    folderNames.map((name) => computeFolderInfo(name, pathParam, all))
  );

  return NextResponse.json({
    ok: true,
    path: pathParam,
    folders: folders,
    files,
  });
}
