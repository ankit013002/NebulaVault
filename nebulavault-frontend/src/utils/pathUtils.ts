import path from "path";

const UPLOAD_ROOT =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

const ROOT_RESOLVED = path.resolve(UPLOAD_ROOT);

export function safeResolve(rel: string) {
  const abs = path.resolve(ROOT_RESOLVED, rel);
  const relBack = path.relative(ROOT_RESOLVED, abs);
  if (relBack.startsWith("..") || path.isAbsolute(relBack)) {
    throw new Error("Invalid path");
  }
  return abs;
}
