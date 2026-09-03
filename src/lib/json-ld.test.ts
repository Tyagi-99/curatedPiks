import assert from "node:assert/strict";
import test from "node:test";
import { absoluteAssetUrl, jsonLdScript, websiteSearchAction } from "./jsonLdFormat.ts";

test("absoluteAssetUrl prefixes site origin on relative paths", () => {
  assert.equal(absoluteAssetUrl("/api/uploads/pic.jpg", "https://www.dealduniya.in"), "https://www.dealduniya.in/api/uploads/pic.jpg");
  assert.equal(absoluteAssetUrl("https://cdn.example/a.jpg", "https://www.dealduniya.in"), "https://cdn.example/a.jpg");
});

test("jsonLdScript escapes script breakers and does not invent ratings", () => {
  const html = jsonLdScript({ name: "</script><script>alert(1)", aggregateRating: undefined });
  assert.doesNotMatch(html, /<\/script>/);
  assert.match(html, /\\u003c/);
  assert.doesNotMatch(html, /"aggregateRating":/);
});

test("website search action points at /links", () => {
  const action = websiteSearchAction("https://www.dealduniya.in");
  assert.equal(action.target, "https://www.dealduniya.in/links?q={search_term_string}");
});
