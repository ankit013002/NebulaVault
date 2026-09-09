/**
 * Object keys are derived entirely from server-side identifiers — never from
 * the client-supplied path — so a malicious name cannot escape its prefix or
 * collide with another tenant. The owner prefix is also what the IAM policy
 * constrains, which is how per-user isolation is enforced in S3 itself.
 */
export function buildObjectKey(input: {
  ownerId: string;
  nodeId: string;
  version: number;
}): string {
  if (!/^[A-Za-z0-9._@:-]{1,128}$/.test(input.ownerId)) {
    throw new Error("ownerId is not safe for use in an object key");
  }
  if (!/^[a-f0-9]{24}$/i.test(input.nodeId)) {
    throw new Error("nodeId must be a 24-character hex ObjectId");
  }
  if (!Number.isInteger(input.version) || input.version < 1) {
    throw new Error("version must be a positive integer");
  }
  return `users/${input.ownerId}/nodes/${input.nodeId}/v${input.version}`;
}
