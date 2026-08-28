import assert from "node:assert/strict";
import test from "node:test";
import { __resetRateLimits, rateLimit } from "./rateLimit.ts";

test("allows up to the limit then blocks", () => {
  __resetRateLimits();
  for (let i = 0; i < 3; i++) {
    assert.equal(rateLimit("k", 3, 60_000).ok, true, `attempt ${i + 1} should pass`);
  }
  const blocked = rateLimit("k", 3, 60_000);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test("keys are independent", () => {
  __resetRateLimits();
  assert.equal(rateLimit("a", 1, 60_000).ok, true);
  assert.equal(rateLimit("a", 1, 60_000).ok, false);
  assert.equal(rateLimit("b", 1, 60_000).ok, true);
});

test("window expiry resets the counter", async () => {
  __resetRateLimits();
  assert.equal(rateLimit("w", 1, 20).ok, true);
  assert.equal(rateLimit("w", 1, 20).ok, false);
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(rateLimit("w", 1, 20).ok, true, "should allow again after the window");
});
