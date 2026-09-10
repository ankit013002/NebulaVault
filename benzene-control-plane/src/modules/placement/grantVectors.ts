/**
 * Transfer-grant contract between the control plane and the node agent.
 *
 * The control plane issues; the agent verifies. They are separate deployables
 * with their own encode/decode, so these vectors are what stop them drifting:
 * both packages assert against this identical file, and a change to either
 * implementation turns one of them red.
 *
 * Generated fixture — do not edit by hand. The private key is a throwaway.
 */

export interface GrantVector {
  payload: {
    v: number;
    objectHash: string;
    deviceId: string;
    op: "put" | "get" | "delete";
    exp: number;
    size?: number;
  };
  /** The exact `<payload>.<signature>` string the control plane emits. */
  grant: string;
}

export const GRANT_TEST_PUBLIC_KEY =
  "MCowBQYDK2VwAyEAQiXjegSw+hk+G7q3AsZ9Prf9CfvbowdPIkPkR4ASVPU=";

export const GRANT_TEST_PRIVATE_KEY =
  "MC4CAQAwBQYDK2VwBCIEILthpTQ2cP5Ar89gY375YMuTroLxLT56Az5haH/8M1Sj";

export const GRANT_VECTORS: GrantVector[] = [
  {
    "payload": {
      "v": 1,
      "objectHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "deviceId": "11111111-1111-1111-1111-111111111111",
      "op": "put",
      "exp": 4102444800,
      "size": 1024
    },
    "grant": "eyJ2IjoxLCJvYmplY3RIYXNoIjoiYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYSIsImRldmljZUlkIjoiMTExMTExMTEtMTExMS0xMTExLTExMTEtMTExMTExMTExMTExIiwib3AiOiJwdXQiLCJleHAiOjQxMDI0NDQ4MDAsInNpemUiOjEwMjR9.R3wlxx0QJUt-Volpd-qsgRn4-t32IaFusYmYiZnSETJjXQHCqTwchLAL_w8v_AtvOdobR4vLigrCx8Os9hdPCQ"
  },
  {
    "payload": {
      "v": 1,
      "objectHash": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "deviceId": "22222222-2222-2222-2222-222222222222",
      "op": "get",
      "exp": 4102444800
    },
    "grant": "eyJ2IjoxLCJvYmplY3RIYXNoIjoiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYiIsImRldmljZUlkIjoiMjIyMjIyMjItMjIyMi0yMjIyLTIyMjItMjIyMjIyMjIyMjIyIiwib3AiOiJnZXQiLCJleHAiOjQxMDI0NDQ4MDB9.z7VDvgnKdTb2QFLXfOKyR9CWd-X7JwlYv7xbIZ9GbbwKe-_OfEnuFYIfih-mjZQENOQF6Ul1Osd2pEWtVZhdCQ"
  }
];
