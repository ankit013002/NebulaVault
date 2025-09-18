import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  console.log(files);

  return NextResponse.json({
    status: "Success",
  });
}
