# Benzene

> Polyglot microservices cloud-storage platform. Self-contained email/password auth, recursive folder drag-and-drop, direct-to-S3 uploads, and a local-first dev mode — actively evolving toward full cloud deployment with AI-assisted file interaction and built-in version control.

---

## Architecture

```mermaid
flowchart LR
  %% ===== Clients =====
  subgraph Clients
    direction TB
    NX["Next.js 15\nReact 19 · TypeScript"]
    EL["Electron\n« planned »"]
  end

  %% ===== Edge =====
  subgraph Edge
    direction TB
    GW["Spring Cloud Gateway\nJWT HS256 verify\nRate limit · Routing · 302 passthrough"]
    CF[("CloudFront CDN\n« planned »")]
  end

  NX --> GW
  EL --> GW

  %% ===== Services =====
  subgraph Services
    direction TB
    AUTH["benzene-auth-service\nNode.js · Express · TypeScript\nsignup · login · refresh\npassword-reset · email-verify\nHS256 JWT + opaque refresh"]
    FILE["File Service\nNode.js · Express · TypeScript\nmetadata · versions\npresigns S3 uploads/downloads"]
    USER["User Service\nJava 21 · Spring Boot\nprofiles · quotas · plans"]
    BILL["Billing Service\nC# · ASP.NET Core · Stripe\n« planned »"]
    AI["AI Chat Service\nRAG · privacy-gated embeddings\n« planned »"]
    VCS["Version Control Service\nbranches · commits · diffs\n« planned »"]
    NOTIFY["Notifier / Audit Worker\n« planned »"]
  end

  GW -->|"/auth/*"| AUTH
  GW -->|"/files/*"| FILE
  GW -->|"/user/*"| USER
  GW -->|"/billing/*"| BILL
  GW -->|"/ai/*"| AI
  GW -->|"/vcs/*"| VCS

  %% ===== Data Stores =====
  subgraph Data_Stores["Data Stores"]
    direction TB
    PG_AUTH[("PostgreSQL\nAuth credentials")]
    PG_USER[("PostgreSQL\nUser profiles")]
    MDB[("MongoDB\nFile metadata\nversions · permissions")]
    S3[("Amazon S3\nobjects + versioning\nSSE · lifecycle · Terraform")]
    FSTORE[("Firestore · Billing\n« planned »")]
    VCS_DB[("PostgreSQL\nVCS metadata\n« planned »")]
    AI_VDB[("Vector DB\nPinecone / pgvector\n« planned »")]
  end

  AUTH --- PG_AUTH
  USER --- PG_USER
  FILE --- MDB
  FILE -->|"presign · head · delete"| S3
  BILL --- FSTORE
  VCS --- VCS_DB
  AI --- AI_VDB
  AI -. "file content for RAG" .-> S3

  %% ===== Events =====
  subgraph Events["Events « planned »"]
    direction TB
    BUS[("SNS / SQS or Kafka")]
    OUTBOX[["Outbox pattern\nidempotent publish · retries"]]
  end

  S3 -- "ObjectCreated" --> BUS
  FILE -- "FileUploaded / FileDeleted" --> BUS
  BUS --> USER & NOTIFY
  FILE & USER & BILL --- OUTBOX

  %% ===== Platform =====
  subgraph Platform["Platform « planned »"]
    direction TB
    OTEL["OpenTelemetry\ntraces · logs · metrics"]
    SECRETS["AWS Secrets Manager / SSM"]
  end

  GW & AUTH & FILE & USER & BILL & NOTIFY --> OTEL
  AUTH & FILE & USER & BILL --- SECRETS

  %% ===== Direct Upload / Download Flow =====
  NX ==>|"direct upload / download\npresigned PUT / GET"| S3
  EL -. "« planned »\ndirect upload" .-> S3
  GW -. "« planned »\n302 → presigned S3 / CloudFront" .-> CF
  CF --- S3
```

---

## Services

| Service                    | Tech                                            | Port | Status  |
| -------------------------- | ----------------------------------------------- | ---- | ------- |
| `nebulavault-frontend`     | Next.js 15, React 19, TypeScript, Redux Toolkit | 3000 | Active  |
| `nebula-gateway`           | Java 21, Spring Cloud Gateway                   | 8080 | Active  |
| `benzene-auth-service`     | Node.js, Express 5, TypeScript, PostgreSQL      | 4000 | Active  |
| `nebulavault-file-service` | Node.js, Express 5, TypeScript, MongoDB (Mongoose) | 5000 | Active  |
| `nebulavault-user-service` | Java 21, Spring Boot 3, PostgreSQL              | 8082 | Active  |
| Billing Service            | C#, ASP.NET Core, Firestore                     | —    | Planned |
| AI Chat Service            | TBD — RAG, Vector DB                            | —    | Planned |
| Version Control Service    | TBD                                             | —    | Planned |
| Notifier / Audit Worker    | Python                                          | —    | Planned |

---

## What Works Today

- Recursive folder & multi-file drag-and-drop (preserves nested structure, supports empty folders)
- Breadcrumb navigation with Redux path state
- Directory listing with size aggregation and `lastModified` metadata
- **Direct-to-S3 uploads** via presigned URLs — bytes go browser to storage, never through Next.js or the Gateway
- **Per-file version history** — every re-upload gets its own object key, so history is never overwritten
- **Download** through short-lived presigned URLs; **delete** with soft-delete and opt-in purge
- Storage usage bar backed by a real usage endpoint
- Self-contained email/password auth: signup, login, logout, refresh, email verification, password reset
- Spring Cloud Gateway: JWT HS256 verification and `X-User-*` header injection, wired end to end
- User service: profile bootstrap on first login, quota fields
- File service: typed Mongoose models (nodes, versions, permissions), presign/commit lifecycle, folder roll-ups
- Terraform for the S3 bucket and least-privilege IAM
- Marketing page with starfield hero (Framer Motion)
- GitHub Actions CI: typecheck, build and test across all services

---

## Auth Design

NebulaVault uses **self-contained email/password authentication** via `benzene-auth-service` — no external OAuth provider required.

| Property             | Value                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Access token         | HS256 JWT, 15 min TTL                                                                                        |
| Refresh token        | Opaque (SHA-256 hashed in DB), 7-day TTL                                                                     |
| Transport            | `httpOnly` cookies (`session` for access token, `refresh_token` for refresh token)                           |
| JWT signing key      | `AUTH_SECRET` (>= 32 chars; 64 hex chars recommended) — shared between auth service and Gateway              |
| Gateway verification | Validates HS256 JWT; injects `X-User-AuthSub`, `X-User-Email`, `X-User-Name` headers for downstream services |

---

## Dev Mode vs Cloud Mode

Both modes run the **same code path**. `STORAGE_DRIVER` picks the driver; the
local one signs and expires its URLs exactly as S3 does, so development
exercises the real browser upload flow rather than a separate mock branch.

|               | `STORAGE_DRIVER=local` (default) | `STORAGE_DRIVER=s3`                |
| ------------- | -------------------------------- | ---------------------------------- |
| Storage       | Local directory                  | Amazon S3                          |
| Upload URL    | HMAC-signed, expiring, served by the file service | Presigned S3 PUT  |
| Uploads       | Browser PUTs directly to the signed URL | Browser PUTs directly to S3 |
| File listing  | Gateway → File Service → MongoDB | Same                               |
| File metadata | MongoDB                          | Same                               |
| AWS creds     | None needed                      | Ambient credential chain           |
| Events        | None                             | Planned: S3 → SNS/SQS + outbox     |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Java 21 + Maven (or `./mvnw`)
- Docker (for PostgreSQL + MongoDB)

### Frontend — `nebulavault-frontend`

```bash
cd nebulavault-frontend
npm install
```

`.env.local`:

```ini
NEXT_PUBLIC_GATEWAY_ORIGIN=http://localhost:8080
GATEWAY_ORIGIN=http://localhost:8080
AUTH_SECRET=<min 32 chars; 64 hex chars recommended>
```

```bash
npm run dev   # → http://localhost:3000
```

### Auth Service — `benzene-auth-service`

```bash
cd benzene-auth-service
npm install
```

`.env`:

```ini
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/nebulavault_auth
AUTH_SECRET=<same secret as frontend>
APP_ORIGIN=http://localhost:3000
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@nebulavault.local
```

```bash
npm run dev   # → http://localhost:4000
```

See [`benzene-auth-service/README.md`](benzene-auth-service/README.md) for full setup, DB schema, and endpoint reference.

### User Service — `nebulavault-user-service`

```bash
cd nebulavault-user-service
DB_URL=jdbc:postgresql://localhost:5432/nebulavault_users ./mvnw spring-boot:run
# → http://localhost:8082
```

### File Service — `nebulavault-file-service`

```bash
cd nebulavault-file-service
npm install
MONGOOSE_URI=mongodb://localhost:27017/nebulavault npm run dev
# → http://localhost:5000
```

`.env` — local storage, no AWS account required:

```ini
MONGOOSE_URI=mongodb://localhost:27017/nebulavault
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=./uploads
LOCAL_STORAGE_PUBLIC_URL=http://localhost:5000/local-objects
```

To run against real S3 instead, apply the Terraform in
`infrastructure/terraform` and swap in its outputs:

```ini
STORAGE_DRIVER=s3
S3_BUCKET=<terraform output bucket_name>
AWS_REGION=<terraform output aws_region>
# Optional: MAX_UPLOAD_BYTES, PRESIGN_TTL_SECONDS
# Optional: S3_ENDPOINT + S3_FORCE_PATH_STYLE=true for LocalStack or MinIO
```

Credentials come from the ambient AWS chain (assumed role, instance profile,
or `AWS_PROFILE`) — never from the service's own configuration.

```bash
npm test         # 87 tests, incl. the full lifecycle on an in-memory MongoDB
npm run typecheck
```

### Gateway — `nebula-gateway`

```bash
cd nebula-gateway
./mvnw spring-boot:run   # → http://localhost:8080
```

---

## Upload Flow (Dev → Cloud)

```
1. Browser  → POST /api/files/uploads          (Next.js → Gateway → File Service)
              File Service reserves a DriveNode and a *pending* FileVersion,
              then returns one presigned PUT target per file.

2. Browser  → PUT <presigned URL>              (straight to S3; no app server)

3. Browser  → POST /api/files/uploads/complete (Next.js → Gateway → File Service)
              File Service HEADs each object, records the size *storage*
              reports, marks the version current and demotes the previous one.
```

Why this shape:

- **Bytes bypass the app entirely.** Neither Next.js nor the Gateway ever
  buffers a file, so upload size is not bounded by a request body limit and
  the app servers stay stateless.
- **Pending until proven.** A version is only shown in the drive once its
  bytes are confirmed present, so an abandoned upload leaves no zero-byte
  ghost file behind.
- **The client cannot lie about size.** The recorded byte count comes from
  `HeadObject`, not from the browser, so under-reporting cannot dodge a quota.
- **Object keys are server-derived.** `users/<ownerId>/nodes/<nodeId>/v<n>` is
  built only from server-side ids, never from the filename, so a crafted name
  cannot escape the owner prefix that the IAM policy is scoped to.

### File API

| Method   | Route                        | Purpose                                   |
| -------- | ---------------------------- | ----------------------------------------- |
| `GET`    | `/files?path=`               | List one directory level                  |
| `GET`    | `/files/usage`               | Bytes and file count for the caller       |
| `POST`   | `/files/uploads`             | Reserve versions, return presigned targets|
| `POST`   | `/files/uploads/complete`    | Confirm uploads and mark them current     |
| `GET`    | `/files/:nodeId/download`    | 302 to a presigned URL (`?redirect=false` returns JSON) |
| `POST`   | `/folders`                   | Create folders that contain no files      |
| `DELETE` | `/drive-nodes/:nodeId`       | Soft delete; `?purge=true` also drops the bytes |

All routes require the `X-User-Id` header, which only the Gateway may set —
it strips any client-supplied `X-User-*` headers before injecting its own.

---

## Roadmap

### Near-term

- [x] Gateway: HS256 JWT verification + `X-User-*` header injection wired up end-to-end
- [x] File Service: S3 presigned upload and download endpoints
- [x] Frontend: listing and upload now go through Gateway routes
- [x] Delete API (soft delete + purge) wired into the UI
- [x] Terraform for the S3 bucket and least-privilege IAM
- [ ] Rename / move APIs + optimistic UI
- [ ] RTK Query caching for the directory listing
- [ ] Per-user quota enforcement on the presign path
- [ ] Reaper for pending versions whose upload was abandoned

### Mid-term

- [ ] Chunked uploads with progress, pause/resume, cancellation
- [ ] File previews: images, PDFs, text (side panel)
- [ ] Trash + restore; starred items; tags; filters
- [ ] Sharing and time-limited links; ACL / permissions UI
- [ ] Per-user quota enforcement across upload paths
- [ ] Event bus (SNS/SQS or Kafka) + outbox pattern per service
- [ ] Notifier / Audit Worker
- [ ] Billing Service (Stripe, plan gating)

### Long-term

- [ ] **AI Chat Service** — RAG over user files; users opt-in per file/folder; privacy-gated embeddings stored in a Vector DB (Pinecone or pgvector)
- [ ] **Version Control Service** — branching, commits, diffs for arbitrary file trees (think Git without the CLI friction)
- [ ] Electron desktop client (offline sync, native drag-and-drop)
- [ ] OpenTelemetry: traces, structured logs, metrics across all services
- [ ] Full-text search; server-side checksums + optional deduplication
- [ ] Unit tests (Vitest) + Playwright E2E
- [ ] AWS Secrets Manager / SSM integration

---

## Project Structure

```
NebulaVault/
├── nebulavault-frontend/          # Next.js 15 + React 19 (App Router, Redux Toolkit)
├── nebula-gateway/                # Spring Cloud Gateway (Java 21)
├── benzene-auth-service/          # Auth service (Node.js + Express + TypeScript)
├── nebulavault-file-service/      # File metadata (Node.js + Express + TypeScript + MongoDB)
├── nebulavault-user-service/      # User profiles (Java 21 + Spring Boot)
├── infrastructure/terraform/      # S3 bucket + least-privilege IAM
├── simple-flask-server/           # Debug sandbox — not production code
└── .github/workflows/             # CI (typecheck, build, test, terraform validate)
```

---

## Security Notes

- `AUTH_SECRET` must be present and at least **32 characters** long. A 64-character hex string (32 bytes) is supported and recommended, but not required. The auth service throws at startup if it's missing or shorter.
- Signup is **atomic**: if any step after credential creation fails, the credential row is rolled back so the user can retry cleanly.
- The Gateway strips any client-supplied `X-User-*` header before injecting its own, so a caller cannot assert an identity. The file service refuses any request without `X-User-Id` rather than defaulting to an unowned tenant.
- Object keys are built only from server-side ids (`users/<ownerId>/nodes/<nodeId>/v<n>`), never from the client-supplied filename, and the IAM policy is scoped to that same `users/*` prefix.
- The S3 bucket blocks all public access, disables ACLs, and its bucket policy denies any request not already over TLS — presigned URLs are bearer credentials in a query string.
- CORS on the bucket is restricted to configured origins; a Terraform validation rule rejects `*`, since a wildcard would let any site spend a leaked presigned URL.
- The local storage driver signs and expires its URLs too, and verifies them in constant time, so development does not run a weaker path than production.
- `httpOnly` cookies prevent JS access to auth tokens (`session` carries the access token; `refresh_token` carries the refresh token).
- Recorded file sizes come from storage's own `HeadObject`, not from the client.

---

## Contributing

Trunk-based with short-lived feature branches. Open a PR, let CI run, merge.

| Prefix      | Use for             |
| ----------- | ------------------- |
| `feature/`  | New features        |
| `fix/`      | Bug fixes           |
| `refactor/` | Refactoring         |
| `chore/`    | Maintenance / setup |
| `docs/`     | Documentation       |
