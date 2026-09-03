import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdminSeed } from "./adminSeed.ts";

test("skips when the target admin email already exists", () => {
  assert.equal(
    resolveAdminSeed({ existingTargetEmail: true, anyAdminExists: true, hasPassword: false, production: true }),
    "skip",
  );
});

test("creates when a password is provided and the email is new", () => {
  assert.equal(
    resolveAdminSeed({ existingTargetEmail: false, anyAdminExists: false, hasPassword: true, production: true }),
    "create",
  );
});

test("skips creating a second admin when one already exists and no password is set", () => {
  assert.equal(
    resolveAdminSeed({ existingTargetEmail: false, anyAdminExists: true, hasPassword: false, production: true }),
    "skip",
  );
});

test("errors in production when no admin exists and ADMIN_PASSWORD is missing", () => {
  assert.equal(
    resolveAdminSeed({ existingTargetEmail: false, anyAdminExists: false, hasPassword: false, production: true }),
    "error",
  );
});

test("creates a local-dev admin without a password", () => {
  assert.equal(
    resolveAdminSeed({ existingTargetEmail: false, anyAdminExists: false, hasPassword: false, production: false }),
    "create",
  );
});
