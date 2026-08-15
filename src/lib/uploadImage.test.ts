import assert from "node:assert/strict";
import test from "node:test";
import { extensionForType, sanitizeBaseName, validateImageFile } from "./uploadImage.ts";

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
