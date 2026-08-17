import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isSafeUploadFilename, UPLOAD_DIR } from "@/lib/uploadImage";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  if (!isSafeUploadFilename(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext];
  if (!type) return new NextResponse("Not found", { status: 404 });

  // Resolve and confirm the path stays inside the upload directory, so the
  // extension allowlist is not the only thing standing between a crafted
  // filename and an arbitrary file read.
  const target = path.resolve(UPLOAD_DIR, filename);
  if (target !== path.join(path.resolve(UPLOAD_DIR), filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const bytes = await readFile(target);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": type,
        // Uploads are attacker-influenced bytes; never let the browser sniff
        // them into something executable.
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
