import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploadImage";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upload." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }

  try {
    const saved = await saveUploadedImage(file);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
