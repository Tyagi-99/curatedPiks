import assert from "node:assert/strict";
import test from "node:test";
import { adminBasePath, adminPath, isPublicAdminProbe, toInternalAdminPath } from "./adminPath.ts";

test("adminPath prefixes the public CMS segment", () => {
  assert.equal(adminBasePath().startsWith("/"), true);
  assert.notEqual(adminBasePath(), "/admin");
  assert.equal(adminPath(), adminBasePath());
  assert.equal(adminPath("login"), `${adminBasePath()}/login`);
  assert.equal(adminPath("/products/new"), `${adminBasePath()}/products/new`);
});

test("public /admin probes are detected and never used as the CMS prefix", () => {
  assert.equal(isPublicAdminProbe("/admin"), true);
  assert.equal(isPublicAdminProbe("/admin/login"), true);
  assert.equal(isPublicAdminProbe("/about"), false);
  assert.equal(isPublicAdminProbe(adminPath("login")), false);
});

test("secret CMS URLs rewrite to the internal /admin tree", () => {
  assert.equal(toInternalAdminPath(adminPath()), "/admin");
  assert.equal(toInternalAdminPath(adminPath("products/new")), "/admin/products/new");
});
