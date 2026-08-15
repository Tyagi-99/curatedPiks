import assert from "node:assert/strict";
import test from "node:test";
import { ctaLabel, formatUpdated, parseSpecs } from "./editorial.ts";

test("parseSpecs reads Label: value lines from object JSON", () => {
  const rows = parseSpecs(JSON.stringify({ Battery: "About 40 hours", ANC: "Yes" }));
  assert.deepEqual(rows, [
    { label: "Battery", value: "About 40 hours" },
    { label: "ANC", value: "Yes" },
  ]);
});

test("parseSpecs returns empty on junk", () => {
  assert.deepEqual(parseSpecs("not-json"), []);
});

test("ctaLabel uses View on for named stores", () => {
  assert.equal(ctaLabel("Amazon", "amazon"), "View on Amazon");
  assert.equal(ctaLabel("Store", "custom"), "Check latest price");
});

test("formatUpdated uses en-IN day month year", () => {
  assert.equal(formatUpdated(new Date("2026-08-14T00:00:00.000Z")), "14 Aug 2026");
  assert.equal(formatUpdated(null), null);
});
