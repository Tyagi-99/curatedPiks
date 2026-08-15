import assert from "node:assert/strict";
import test from "node:test";
import { isBareSocialHomepage, isHttpUrl, realSocialUrl } from "./urls.ts";

test("isHttpUrl accepts only http(s)", () => {
  assert.equal(isHttpUrl("https://www.amazon.in/dp/x"), true);
  assert.equal(isHttpUrl("javascript:alert(1)"), false);
  assert.equal(isHttpUrl("/relative"), false);
});

test("bare Instagram homepage is empty", () => {
  assert.equal(isBareSocialHomepage("https://instagram.com/"), true);
  assert.equal(isBareSocialHomepage("https://instagram.com"), true);
  assert.equal(isBareSocialHomepage("https://instagram.com/curatedpicks"), false);
  assert.equal(realSocialUrl("https://instagram.com/"), null);
});
