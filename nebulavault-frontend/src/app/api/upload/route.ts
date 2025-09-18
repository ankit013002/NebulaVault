import { readDb, writeDb } from "@/utils/fileDb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  const db = await readDb();

  console.log(db.find((f) => f.name === "s"));

  const newEntries = files
    .filter((file) => !db.find((f) => f.name === file.name))
    .map((file) => {
      return {
        name: file.name,
        owner: "You",
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };
    });

  let statusMessage = "";
  const updated = [...db];

  if (newEntries.length > 0) {
    updated.push(...newEntries);
    await writeDb(updated);
    statusMessage = "Files uploaded";
  } else {
    statusMessage = "No updates to db";
  }

  return NextResponse.json({
    status: "Success",
    files: updated,
    message: statusMessage,
  });
}
