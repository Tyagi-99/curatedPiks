import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  if (!/^[a-z0-9.-]+$/i.test(filename) || filename.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext];
  if (!type) return new NextResponse("Not found", { status: 404 });

  try {
    const bytes = await readFile(path.join("/tmp", "curatedpicks-uploads", filename));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
