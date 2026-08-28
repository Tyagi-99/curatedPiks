import assert from "node:assert/strict";
import test from "node:test";
import {
  extensionForType,
  isSafeUploadFilename,
  sanitizeBaseName,
  sniffImageType,
  validateImageFile,
} from "./uploadImage.ts";

test("accepts jpg png webp only", () => {
  assert.equal(extensionForType("image/jpeg"), "jpg");
  assert.equal(extensionForType("image/png"), "png");
  assert.equal(extensionForType("image/webp"), "webp");
  assert.equal(extensionForType("image/gif"), null);
});

test("sanitizeBaseName strips junk", () => {
  assert.equal(sanitizeBaseName("AirWave Pro!!.JPG"), "airwave-pro");
  assert.equal(sanitizeBaseName("..."), "product");
});

test("validateImageFile rejects large and empty files", () => {
  assert.equal(validateImageFile({ type: "image/jpeg", size: 1200 }), null);
  assert.equal(validateImageFile({ type: "image/gif", size: 1200 }), "Use a JPG, PNG, or WebP image.");
  assert.equal(validateImageFile({ type: "image/jpeg", size: 0 }), "That file is empty.");
  assert.equal(validateImageFile({ type: "image/jpeg", size: 6 * 1024 * 1024 }), "Keep the image under 5 MB.");
});

test("isSafeUploadFilename blocks traversal and odd names", () => {
  assert.equal(isSafeUploadFilename("1755000000-airwave.jpg"), true);
  assert.equal(isSafeUploadFilename("../../etc/passwd"), false);
  assert.equal(isSafeUploadFilename("a/../b.png"), false);
  assert.equal(isSafeUploadFilename("..png"), false);
  assert.equal(isSafeUploadFilename("/etc/passwd"), false);
  assert.equal(isSafeUploadFilename(""), false);
});

test("sniffImageType reads magic bytes, not the declared type", () => {
  assert.equal(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0x00])), "jpg");
  assert.equal(
    sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    "png",
  );
  const webp = new Uint8Array(12);
  webp.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  webp.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
  assert.equal(sniffImageType(webp), "webp");
});

test("sniffImageType rejects non-images and truncated data", () => {
  // A shell script or HTML page announced as image/png.
  assert.equal(sniffImageType(new TextEncoder().encode("#!/bin/sh\necho hi")), null);
  assert.equal(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>")), null);
  assert.equal(sniffImageType(new Uint8Array([0xff, 0xd8])), null);
  assert.equal(sniffImageType(new Uint8Array()), null);
});
