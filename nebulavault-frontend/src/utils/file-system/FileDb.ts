import { FileType } from "@/types/File";
import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "mockDb.json");

export async function readDb(): Promise<FileType[]> {
  const raw = await fs.readFile(dbPath, "utf-8");
  if (!raw.trim()) {
    return [];
  }
  return JSON.parse(raw);
}

export async function writeDb(data: FileType[]): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}
