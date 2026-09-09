# Benzene node agent

The process that turns a computer into storage for a Benzene vault.

It does three things: holds this device's identity, reports presence to the
control plane, and serves objects to peers on the local network.

## Running it

```bash
cd benzene-node-agent
npm install
BENZENE_CONTROL_PLANE_URL=http://localhost:8080 \
BENZENE_ALLOCATED_BYTES=$((50 * 1024 * 1024 * 1024)) \
npm run dev
```

On first run it generates an Ed25519 keypair, requests enrollment, and prints a
pairing code. Approve it from the web app (or `POST /devices/enrollments/approve`)
and the agent starts heartbeating.

| Variable | Default | Meaning |
| --- | --- | --- |
| `BENZENE_CONTROL_PLANE_URL` | `http://localhost:8080` | Gateway origin |
| `BENZENE_DATA_DIR` | `~/.benzene` | Identity and storage root |
| `BENZENE_ALLOCATED_BYTES` | `0` | Bytes this device contributes |
| `BENZENE_AGENT_PORT` | `7070` | Transfer server port |
| `BENZENE_HEARTBEAT_MS` | `30000` | Presence interval |
| `BENZENE_DEVICE_NAME` | hostname | Name shown in the Devices list |

## How storage is laid out

Objects are addressed by the SHA-256 of their bytes, never by the user's
filename or path:

```
storage/
├── objects/ab/abc123…      the bytes
├── meta/ab/abc123….json    sidecar: version, size, encryption mode
└── tmp/                    in-flight writes, cleared on restart
```

That decouples physical layout from the logical tree, makes corruption
detectable, makes repeated transfers idempotent, and leaves room for
deduplication. The sidecar mirrors architecture §54, so a node retains enough
local metadata to help reconstruct a lost control plane.

## Deliberate design points

**Allocation is a hard ceiling, enforced against bytes that actually arrive** —
not the size a client claims. A caller that under-reports is cut off mid-stream.

**Writes are atomic.** Bytes land in `tmp/` and are renamed into place only once
complete, so a crash leaves debris rather than a truncated object that would
pass an existence check and fail verification later.

**Usage is recomputed from disk at startup.** An in-memory counter cannot be
trusted across a restart the agent did not choose.

**The object format is versioned.** Client-side encryption is not implemented
yet, but each object records `v` and an explicit `encryption: "none"`. When
encryption lands, encrypted and plaintext-era objects coexist and no migration
is needed — which matters because these files live on machines we do not
control.

## Known limits

- **The transfer token is one shared secret per process**, not the per-object,
  per-peer, short-lived grant of architecture §81. Adequate while the port is
  LAN-only; it must be tightened before remote transfers.
- **The private key is a `0600` file**, not platform-secure storage. Keychain,
  DPAPI and Keystore are per-platform native work (§34).
- **No placement, replication or repair yet.** The agent stores what it is given
  and serves what it holds; deciding *what* it should hold is the control
  plane's job and does not exist yet.
- **Whole files, not chunks.** Deliberate, per §107 — chunking lands after the
  core loop is proven.

## Protocol contract

`src/protocolVectors.ts` is byte-identical to the control plane's copy and both
packages assert against it. The agent signs and the control plane verifies, so
these vectors are what stop two separate deployables drifting apart on the wire
format. CI diffs the two files.
