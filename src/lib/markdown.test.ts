import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdown } from "./markdown.ts";

test("renders heading bold link and image", () => {
  const html = renderMarkdown("## Hello\n\nThis is **bold** and [a link](https://example.com).\n\n![Alt](/uploads/pic.jpg)");
  assert.match(html, /<h2>Hello<\/h2>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /src="\/uploads\/pic.jpg"/);
});

test("escapes html and drops javascript urls", () => {
  const html = renderMarkdown('Click <script>alert(1)</script> [x](javascript:alert(1))');
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /javascript:/);
});

test("renders lists", () => {
  const html = renderMarkdown("- one\n- two");
  assert.equal(html, "<ul><li>one</li><li>two</li></ul>");
});
