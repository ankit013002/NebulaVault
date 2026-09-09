import { describe, expect, it } from "vitest";

import { buildObjectKey } from "./objectKeys.js";

const NODE_ID = "0123456789abcdef01234567";

describe("buildObjectKey", () => {
  it("namespaces objects under the owner and node", () => {
    expect(buildObjectKey({ ownerId: "user-1", nodeId: NODE_ID, version: 3 })).toBe(
      `users/user-1/nodes/${NODE_ID}/v3`
    );
  });

  it("is stable across calls for the same inputs", () => {
    const args = { ownerId: "user-1", nodeId: NODE_ID, version: 1 };
    expect(buildObjectKey(args)).toBe(buildObjectKey(args));
  });

  // The owner prefix is what the IAM policy scopes on, so anything that could
  // break out of it must be rejected rather than sanitised silently.
  it.each([
    ["path traversal", "../../etc"],
    ["a slash", "a/b"],
    ["a backslash", String.raw`a\b`],
    ["an empty id", ""],
    ["a percent escape", "%2e%2e"],
  ])("rejects an ownerId containing %s", (_label, ownerId) => {
    expect(() => buildObjectKey({ ownerId, nodeId: NODE_ID, version: 1 })).toThrow(
      /not safe/
    );
  });

  it("rejects a nodeId that is not an ObjectId", () => {
    expect(() =>
      buildObjectKey({ ownerId: "user-1", nodeId: "../../secrets", version: 1 })
    ).toThrow(/24-character hex/);
  });

  it.each([0, -1, 1.5, Number.NaN])("rejects version %s", (version) => {
    expect(() => buildObjectKey({ ownerId: "user-1", nodeId: NODE_ID, version })).toThrow(
      /positive integer/
    );
  });
});
