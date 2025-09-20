import { FileType } from "@/types/File";
import { readDb } from "@/utils/FileDb";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("Pulling files");

  const files = (await readDb()) as FileType[];

  console.log(files);

  return NextResponse.json({
    status: "Success",
    files: files,
  });
}
