import { describe, expect, it } from "vitest";

import { canonicalRequest, verifyRequestSignature } from "./deviceIdentity.js";
import {
  PROTOCOL_TEST_PUBLIC_KEY,
  PROTOCOL_VECTORS,
} from "./protocolVectors.js";

/**
 * The node agent asserts against this same vector file. These two suites are
 * the contract between the packages: the agent proves it produces these bytes,
 * this proves the control plane accepts them.
 */
describe("wire-format contract", () => {
  it.each(PROTOCOL_VECTORS)(
    "builds the agreed canonical string for $method $path",
    (vector) => {
      expect(
        canonicalRequest({
          method: vector.method,
          path: vector.path,
          timestamp: vector.timestamp,
          body: vector.body,
        })
      ).toBe(vector.canonical);
    }
  );

  it.each(PROTOCOL_VECTORS)(
    "accepts the signature an agent would send for $method $path",
    (vector) => {
      expect(
        verifyRequestSignature({
          publicKey: PROTOCOL_TEST_PUBLIC_KEY,
          signature: vector.signature,
          message: vector.canonical,
        })
      ).toBe(true);
    }
  );

  it("rejects a vector signature replayed onto a different vector", () => {
    const [first, second] = PROTOCOL_VECTORS;
    expect(first && second).toBeTruthy();

    expect(
      verifyRequestSignature({
        publicKey: PROTOCOL_TEST_PUBLIC_KEY,
        signature: first!.signature,
        message: second!.canonical,
      })
    ).toBe(false);
  });
});
