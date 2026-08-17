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

export async function saveUploadedImage(file: File): Promise<{ url: string }> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const ext = extensionForType(file.type);
  if (!ext) throw new Error("Use a JPG, PNG, or WebP image.");

  const filename = `${Date.now()}-${sanitizeBaseName(file.name)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return { url: `/api/uploads/${filename}` };
}
