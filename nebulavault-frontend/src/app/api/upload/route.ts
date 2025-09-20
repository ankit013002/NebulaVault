import { FileSize, FileType } from "@/types/File";
import { readDb, writeDb } from "@/utils/FileDb";
import { getNormalizedSize } from "@/utils/NormalizedSize";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  const db = await readDb();
  let updated: FileType[] = [...db];

  files.forEach((file) => {
    const exists = updated.find((f) => f.name === file.name);
    if (exists) {
      updated = updated.filter((f) => f.name !== file.name);
    }
    const size = getNormalizedSize(file.size);

    updated.push({
      name: file.name,
      owner: "You",
      size: size,
      type: file.type,
      lastModified: file.lastModified,
    });
  });

  await writeDb(updated);

  return NextResponse.json({
    status: "Success",
    files: updated,
  });
}
