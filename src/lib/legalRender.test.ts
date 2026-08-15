import assert from "node:assert/strict";
import test from "node:test";
import { splitLegalBlocks } from "./legalRender.ts";

test("splits heading plus following paragraph on a single newline", () => {
  const blocks = splitLegalBlocks("## Who we are\nCuratedPicks is independent.\n\nNext para.");
  assert.deepEqual(blocks, [
    { type: "h2", text: "Who we are" },
    { type: "p", text: "CuratedPicks is independent." },
    { type: "p", text: "Next para." },
  ]);
});
