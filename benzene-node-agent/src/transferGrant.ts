import { createPublicKey, verify as cryptoVerify } from "node:crypto";

/**
 * Verifies the control plane's authorisation to move one object.
 *
 * The control plane holds the signing half; this device received the public key
 * at enrollment. A grant names one object, one device, one operation and an
 * expiry, so a leaked grant exposes a single object for a few minutes rather
 * than the whole store for the life of the process.
 *
 * The encoding is pinned by shared test vectors, the same way request signing
 * is: the two packages are separate deployables and must not drift.
 */

export const GRANT_VERSION = 1;

export type TransferOperation = "put" | "get" | "delete";

export interface TransferGrantPayload {
  v: number;
  objectHash: string;
  deviceId: string;
  op: TransferOperation;
  exp: number;
  size?: number;
}

export type GrantRejection =
  | "malformed"
  | "bad_signature"
  | "unsupported_version"
  | "expired"
  | "wrong_device"
  | "wrong_object"
  | "wrong_operation";

export type GrantVerification =
  | { ok: true; payload: TransferGrantPayload }
  | { ok: false; reason: GrantRejection };

function fromBase64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Checks a grant against what is actually being asked for.
 *
 * The expected object, device and operation are supplied by the caller rather
 * than trusted from the grant, so a valid grant for one object cannot be
 * replayed to fetch another.
 */
export function verifyTransferGrant(input: {
  grant: string;
  controlPlanePublicKey: string;
  expected: {
    objectHash: string;
    deviceId: string;
    op: TransferOperation;
  };
  now?: number;
}): GrantVerification {
  const parts = input.grant.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, reason: "malformed" };
  }
  const [encoded, signature] = parts as [string, string];

  let verified = false;
  try {
    const publicKey = createPublicKey({
      key: Buffer.from(input.controlPlanePublicKey, "base64"),
      format: "der",
      type: "spki",
    });
    verified = cryptoVerify(
      null,
      Buffer.from(encoded, "utf8"),
      publicKey,
      fromBase64url(signature)
    );
  } catch {
    return { ok: false, reason: "bad_signature" };
  }

  // Signature first: never parse a payload that has not been authenticated.
  if (!verified) return { ok: false, reason: "bad_signature" };

  let payload: TransferGrantPayload;
  try {
    payload = JSON.parse(fromBase64url(encoded).toString("utf8")) as TransferGrantPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (payload.v !== GRANT_VERSION) {
    return { ok: false, reason: "unsupported_version" };
  }
  if (typeof payload.exp !== "number" || (input.now ?? Date.now()) / 1000 > payload.exp) {
    return { ok: false, reason: "expired" };
  }
  if (payload.deviceId !== input.expected.deviceId) {
    return { ok: false, reason: "wrong_device" };
  }
  if (payload.objectHash !== input.expected.objectHash) {
    return { ok: false, reason: "wrong_object" };
  }
  if (payload.op !== input.expected.op) {
    return { ok: false, reason: "wrong_operation" };
  }

  return { ok: true, payload };
}
