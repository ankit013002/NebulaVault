import { describe, expect, it } from "vitest";

import {
  canonicalRequest,
  codesMatch,
  generateDeviceKeyPair,
  generatePairingCode,
  isValidPublicKey,
  signRequest,
  verifyRequestSignature,
} from "./deviceIdentity.js";

describe("device keypairs", () => {
  it("generates a valid Ed25519 keypair", () => {
    const keys = generateDeviceKeyPair();

    expect(isValidPublicKey(keys.publicKey)).toBe(true);
    expect(keys.privateKey).not.toBe(keys.publicKey);
  });

  it("generates a distinct key each time", () => {
    expect(generateDeviceKeyPair().publicKey).not.toBe(
      generateDeviceKeyPair().publicKey
    );
  });

  it.each([
    ["empty", ""],
    ["not base64", "!!!!"],
    ["base64 garbage", Buffer.from("nonsense").toString("base64")],
  ])("rejects a %s public key", (_label, key) => {
    expect(isValidPublicKey(key)).toBe(false);
  });

  it("rejects an RSA key, since only Ed25519 is accepted", async () => {
    const { generateKeyPairSync } = await import("node:crypto");
    const { publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const spki = publicKey.export({ type: "spki", format: "der" }).toString("base64");

    expect(isValidPublicKey(spki)).toBe(false);
  });
});

describe("request signing", () => {
  const keys = generateDeviceKeyPair();
  const base = {
    method: "POST",
    path: "/devices/heartbeat",
    timestamp: "1757000000",
    body: JSON.stringify({ usedBytes: 10 }),
  };

  function sign(overrides: Partial<typeof base> = {}): string {
    return signRequest(keys.privateKey, canonicalRequest({ ...base, ...overrides }));
  }

  it("verifies a signature over the exact request", () => {
    expect(
      verifyRequestSignature({
        publicKey: keys.publicKey,
        signature: sign(),
        message: canonicalRequest(base),
      })
    ).toBe(true);
  });

  // Each of these is a replay the signature must not survive.
  it.each([
    ["a different path", { path: "/devices/other" }],
    ["a different method", { method: "DELETE" }],
    ["a different body", { body: JSON.stringify({ usedBytes: 999 }) }],
    ["a different timestamp", { timestamp: "1757009999" }],
  ])("rejects a signature replayed with %s", (_label, overrides) => {
    expect(
      verifyRequestSignature({
        publicKey: keys.publicKey,
        signature: sign(),
        message: canonicalRequest({ ...base, ...overrides }),
      })
    ).toBe(false);
  });

  it("rejects a signature made by a different device", () => {
    const other = generateDeviceKeyPair();

    expect(
      verifyRequestSignature({
        publicKey: keys.publicKey,
        signature: signRequest(other.privateKey, canonicalRequest(base)),
        message: canonicalRequest(base),
      })
    ).toBe(false);
  });

  it.each([
    ["empty", ""],
    ["malformed", "not-a-signature"],
  ])("returns false rather than throwing on a %s signature", (_label, signature) => {
    expect(
      verifyRequestSignature({
        publicKey: keys.publicKey,
        signature,
        message: canonicalRequest(base),
      })
    ).toBe(false);
  });

  it("distinguishes an empty body from a whitespace body", () => {
    expect(canonicalRequest({ ...base, body: "" })).not.toBe(
      canonicalRequest({ ...base, body: " " })
    );
  });
});

describe("pairing codes", () => {
  it("formats as two groups of four", () => {
    const code = generatePairingCode(Buffer.alloc(8, 7));
    expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  // Ambiguous glyphs are excluded so a code read off one screen and typed into
  // another cannot be mistyped.
  it("never emits characters that look alike", () => {
    for (let byte = 0; byte < 256; byte += 1) {
      const code = generatePairingCode(Buffer.alloc(8, byte)).replace("-", "");
      expect(code).not.toMatch(/[01OIL]/);
    }
  });

  it("is deterministic for the same randomness", () => {
    const bytes = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(generatePairingCode(bytes)).toBe(generatePairingCode(bytes));
  });

  it("matches case-insensitively and ignores surrounding space", () => {
    expect(codesMatch("abcd-efgh", "  ABCD-EFGH  ")).toBe(true);
  });

  it.each([
    ["a different code", "ABCD-EFGH", "ABCD-EFGJ"],
    ["a shorter code", "ABCD-EFGH", "ABCD"],
    ["an empty code", "ABCD-EFGH", ""],
  ])("does not match %s", (_label, a, b) => {
    expect(codesMatch(a, b)).toBe(false);
  });
});
