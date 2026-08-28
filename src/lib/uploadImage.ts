import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function extensionForType(type: string): string | null {
  return ALLOWED_IMAGE_TYPES[type as keyof typeof ALLOWED_IMAGE_TYPES] ?? null;
}

export function sanitizeBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").toLowerCase();
  const cleaned = base.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
  return cleaned || "product";
}

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!extensionForType(file.type)) return "Use a JPG, PNG, or WebP image.";
  if (file.size <= 0) return "That file is empty.";
  if (file.size > MAX_IMAGE_BYTES) return "Keep the image under 5 MB.";
  return null;
}

/**
 * Where runtime uploads are stored.
 *
 * Writing into `public/` does not work: Next only serves the `public/`
 * directory as it existed at build time, so a file written after `next build`
 * returns 404. Everything therefore goes to a runtime directory and is served
 * back through `/api/uploads/[filename]`.
 *
 * Set UPLOAD_DIR to a persistent volume for a long-lived host. The default is
 * per-instance and ephemeral, so a multi-instance or serverless deployment
 * needs object storage instead (see README).
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join("/tmp", "curatedpicks-uploads");

export function isSafeUploadFilename(name: string): boolean {
  return /^[a-z0-9][a-z0-9.-]*$/i.test(name) && !name.includes("..");
}

/**
 * Identify an image from its leading bytes.
 *
 * `file.type` is supplied by the client and is trivially forged, so the
 * declared type alone is not evidence of content. This reads the actual magic
 * numbers instead and is the value we trust.
 */
export function sniffImageType(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) return "png";
  // WebP: "RIFF" .... "WEBP"
  if (bytes.length >= 12) {
    const ascii = (start: number, end: number) =>
      String.fromCharCode(...Array.from(bytes.subarray(start, end)));
    if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  }
  return null;
}

export async function saveUploadedImage(file: File): Promise<{ url: string }> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const bytes = Buffer.from(await file.arrayBuffer());

  // Trust the bytes, not the declared Content-Type. A text file announced as
  // image/png was previously accepted and written to disk with a .png name.
  const sniffed = sniffImageType(bytes);
  if (!sniffed) throw new Error("That file is not a valid JPG, PNG, or WebP image.");
  if (sniffed !== extensionForType(file.type)) {
    throw new Error("That file's contents do not match its type. Re-export and try again.");
  }

  const filename = `${Date.now()}-${sanitizeBaseName(file.name)}.${sniffed}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return { url: `/api/uploads/${filename}` };
}
