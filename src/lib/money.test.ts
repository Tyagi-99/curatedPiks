import assert from "node:assert/strict";
import test from "node:test";
import { discountPercent, showCompareAt } from "./money.ts";

test("discountPercent is null when compare-at is missing or not higher", () => {
  assert.equal(discountPercent(999, null), null);
  assert.equal(discountPercent(999, 500), null);
  assert.equal(discountPercent(999, 999), null);
});

test("discountPercent rounds the markdown when compare-at is higher", () => {
  assert.equal(discountPercent(800, 1000), 20);
});

test("showCompareAt only when compare-at is a higher price", () => {
  assert.equal(showCompareAt(999, null), false);
  assert.equal(showCompareAt(999, 0), false);
  assert.equal(showCompareAt(999, 500), false);
  assert.equal(showCompareAt(999, 999), false);
  assert.equal(showCompareAt(999, 1299), true);
});
