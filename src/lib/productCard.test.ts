import assert from "node:assert/strict";
import test from "node:test";
import { checkPriceCta, editorialBadge, ratingRow } from "./productCard.ts";

test("checkPriceCta uses View on for named stores", () => {
  assert.equal(checkPriceCta("Amazon", "amazon"), "View on Amazon →");
  assert.equal(checkPriceCta("Myntra", "myntra"), "View on Myntra →");
  assert.equal(checkPriceCta("Flipkart", "flipkart"), "View on Flipkart →");
  assert.equal(checkPriceCta("Nykaa", "nykaa"), "View on Nykaa →");
  assert.equal(checkPriceCta("Store", "custom"), "Check latest price →");
});

test("editorialBadge uses existing flags only and prefers featured over popular", () => {
  assert.equal(editorialBadge({}), null);
  assert.equal(editorialBadge({ pinnedToBio: true, popular: true }), "Editor's Pick");
  assert.equal(editorialBadge({ pinnedToBio: false, popular: true }), "Top Pick");
  assert.equal(editorialBadge({ pinnedToBio: false, popular: false }), null);
});

test("ratingRow is hidden when rating or count is missing or fake-zero", () => {
  assert.equal(ratingRow(undefined, undefined), null);
  assert.equal(ratingRow(null, null), null);
  assert.equal(ratingRow(0, 12), null);
  assert.equal(ratingRow(4.3, 0), null);
  assert.equal(ratingRow(4.3, 1200), "★ 4.3 · 1.2k reviews");
});
