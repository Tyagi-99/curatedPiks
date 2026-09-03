import assert from "node:assert/strict";
import test from "node:test";
import { postStatusForSave, publishedForSave } from "./publishState.ts";

test("editors keep the existing published flag instead of unpublishing", () => {
  assert.equal(publishedForSave("EDITOR", true, true), true);
  assert.equal(publishedForSave("EDITOR", false, true), true);
  assert.equal(publishedForSave("EDITOR", true, false), false);
  assert.equal(publishedForSave("EDITOR", false, undefined), false);
});

test("admins follow the publish checkbox", () => {
  assert.equal(publishedForSave("ADMIN", true, false), true);
  assert.equal(publishedForSave("ADMIN", false, true), false);
});

test("editors keep a published post published", () => {
  assert.equal(postStatusForSave("EDITOR", false, "PUBLISHED"), "PUBLISHED");
  assert.equal(postStatusForSave("EDITOR", true, "DRAFT"), "DRAFT");
  assert.equal(postStatusForSave("ADMIN", true, "DRAFT"), "PUBLISHED");
  assert.equal(postStatusForSave("ADMIN", false, "PUBLISHED"), "DRAFT");
});
