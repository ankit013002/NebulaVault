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
    FILE["File Service\nNode.js · Express\nfile metadata · presigned S3\n« S3 planned »"]
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
    S3[("Amazon S3\nobjects + versioning\n« planned »")]
    FSTORE[("Firestore · Billing\n« planned »")]
    VCS_DB[("PostgreSQL\nVCS metadata\n« planned »")]
    AI_VDB[("Vector DB\nPinecone / pgvector\n« planned »")]
  end

  AUTH --- PG_AUTH
  USER --- PG_USER
  FILE --- MDB
  FILE -. "« planned »" .-> S3
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
  NX -. "« planned »\ndirect upload\npresigned POST / PUT" .-> S3
  EL -. "« planned »\ndirect upload\npresigned POST / PUT" .-> S3
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
| `nebulavault-file-service` | Node.js, Express 5, MongoDB (Mongoose)          | 5000 | Active  |
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
- Storage usage bar
- Self-contained email/password auth: signup, login, logout, refresh, email verification, password reset
- Spring Cloud Gateway bootstrap (JWT HS256 verify, CORS config, routing scaffolding)
- User service: profile bootstrap on first login, quota fields
- File metadata service: MongoDB models (nodes, versions, permissions), listing endpoint
- Marketing page with starfield hero (Framer Motion)
- GitHub Actions CI/CD pipeline

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

|               | Dev Mode (today)                    | Cloud Mode (planned)                     |
| ------------- | ----------------------------------- | ---------------------------------------- |
| Storage       | Local `uploads/` dir                | Amazon S3 + presigned URLs               |
| File listing  | `/api/files` Next.js route handler  | Gateway → File Service → MongoDB         |
| Uploads       | `/api/dev-proxy/files/presign-batch` Next.js dev proxy | Browser → S3 direct (presigned POST/PUT) |
| Auth          | benzene-auth-service cookie         | Same                                     |
| File metadata | `data/mockDb.json`                  | MongoDB via File Service                 |
| Events        | None                                | SNS/SQS or Kafka + outbox pattern        |

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
mkdir -p uploads data
echo "[]" > data/mockDb.json
```

`.env.local`:

```ini
NEXT_PUBLIC_GATEWAY_ORIGIN=http://localhost:8080
UPLOAD_DIR=./uploads
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

### Gateway — `nebula-gateway`

```bash
cd nebula-gateway
./mvnw spring-boot:run   # → http://localhost:8080
```

---

## Upload Flow (Dev → Cloud)

**Dev mode:**

```
Browser drag-drop → POST /api/dev-proxy/files/presign-batch (Next.js dev proxy → File Service)
                 → File Service returns mock presign response
                 → Writes to local file system
```

**Cloud mode (planned — route names not yet implemented in Gateway/File Service):**

```
Browser → POST /files/presign-batch (Gateway → File Service)
       → File Service returns presigned S3 POST fields
       → Browser uploads directly to S3
       → Browser calls POST /drive-nodes (Gateway → File Service) to record metadata in MongoDB
       → S3 ObjectCreated event → SNS/SQS → File Service / Notifier
```

---

## Roadmap

### Near-term

- [ ] Gateway: HS256 JWT verification + `X-User-*` header injection wired up end-to-end
- [ ] File Service: S3 presigned upload and download endpoints
- [ ] Frontend: switch listing and upload to Gateway routes; RTK Query caching
- [ ] Delete / rename / move APIs + optimistic UI
- [ ] URL ↔ state sync (`?p=...`) for shareable deep links

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
├── nebulavault-file-service/      # File metadata (Node.js + Express + MongoDB)
├── nebulavault-user-service/      # User profiles (Java 21 + Spring Boot)
├── simple-flask-server/           # Debug sandbox — not production code
└── .github/workflows/             # CI/CD (lint, typecheck, build)
```

---

## Security Notes

- `AUTH_SECRET` must be present and at least **32 characters** long. A 64-character hex string (32 bytes) is supported and recommended, but not required. The auth service throws at startup if it's missing or shorter.
- Signup is **atomic**: if any step after credential creation fails, the credential row is rolled back so the user can retry cleanly.
- Path traversal protection on all local read/write ops (`safeResolve`, `safeJoin`); all writes are constrained to `UPLOAD_ROOT`.
- `httpOnly` cookies prevent JS access to auth tokens (`session` cookie carries the access token; `refresh_token` carries the refresh token).
- Planned: presign redirect responses should propagate the upstream HTTP status rather than hardcoding 200.

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
