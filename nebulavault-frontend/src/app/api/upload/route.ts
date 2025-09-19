import { readDb, writeDb } from "@/utils/fileDb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  const db = await readDb();
  let updated = [...db];

  files.forEach((file) => {
    const exists = updated.find((f) => f.name === file.name);
    if (exists) {
      updated = updated.filter((f) => f.name !== file.name);
    }
    updated.push({
      name: file.name,
      owner: "You",
      size: file.size,
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
