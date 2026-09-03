import assert from "node:assert/strict";
import test from "node:test";
import { contactSpamReason, isHoneypotTriggered } from "./contactGuard.ts";

test("honeypot trips only when the hidden field has content", () => {
  assert.equal(isHoneypotTriggered(""), false);
  assert.equal(isHoneypotTriggered("   "), false);
  assert.equal(isHoneypotTriggered("http://spam.example"), true);
});

test("plain contact copy is allowed", () => {
  assert.equal(
    contactSpamReason({
      name: "Husain",
      email: "hello@dealduniya.in",
      body: "The AirWave review link on Instagram is 404. Can you check?",
    }),
    null,
  );
});

test("rejects HTML and shortened links used in the current inbox spam", () => {
  assert.equal(
    contactSpamReason({
      name: "ArthurAnync",
      email: "bazkhhh@ishowfirstmail.com",
      body: 'this content <a href="https://santander-online.us.com/">santander bank login</a>',
    }),
    "html",
  );
  assert.equal(
    contactSpamReason({
      name: "Staceyevoff",
      email: "stacey@example.com",
      body: "Right now https://bit.ly/4ghsyBo Right now",
    }),
    "shortener",
  );
});
