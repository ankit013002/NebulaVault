/**
 * Wire-format contract between the node agent and the control plane.
 *
 * The agent signs; the control plane verifies. They are separate deployables
 * with their own copies of the canonical-string construction, so these vectors
 * are what stop them drifting: both packages assert against this identical
 * file, and any change to either implementation turns one of them red.
 *
 * Ed25519 signing is deterministic, so a fixed key and message pin an exact
 * signature rather than merely a verifiable one.
 *
 * Generated fixture — do not edit by hand. The private key is a throwaway,
 * used only here.
 */

export interface ProtocolVector {
  method: string;
  path: string;
  timestamp: string;
  body: string;
  /** Exact newline-joined string that gets signed. */
  canonical: string;
  /** Base64 Ed25519 signature over `canonical` by PROTOCOL_TEST_PRIVATE_KEY. */
  signature: string;
}

export const PROTOCOL_TEST_PUBLIC_KEY =
  "MCowBQYDK2VwAyEAkOemjLKY+AAlL3krF6//R3RkcpX9NABGhWoMiofKCPs=";

export const PROTOCOL_TEST_PRIVATE_KEY =
  "MC4CAQAwBQYDK2VwBCIEIDMiAMY1AxX18UfPOA9buHneN8tYis4hvM0faP6V66HQ";

export const PROTOCOL_VECTORS: ProtocolVector[] = [
  {
    "method": "POST",
    "path": "/agent/heartbeat",
    "timestamp": "1757000000",
    "body": "{\"usedBytes\":42}",
    "canonical": "POST\n/agent/heartbeat\n1757000000\n6c35e28425adacac4314d30b03c53f99b491c0d0b8d6845d6084c3fe8ecf71f2",
    "signature": "emvQiffS6jUocDF9d9wvYLIldL3Ha9adbbNzHL0CQ1Hr9MQlDgOWHBvVSFUrqvxL6XlupBacBBVHMaEmSqLuBw=="
  },
  {
    "method": "GET",
    "path": "/agent/enrollments/abc?publicKey=x",
    "timestamp": "1757000001",
    "body": "",
    "canonical": "GET\n/agent/enrollments/abc?publicKey=x\n1757000001\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "signature": "Tmm1CTWAxFHRxqFJGq2bPKaq1PlgbIC0Q2YWkO+cZH2O4deYpGihN1/hPPvsJ4qaDkqOLTz7PJsVnccPzIZLBw=="
  }
];
