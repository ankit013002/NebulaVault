# Nebula Vault

> Local‑first Drive UI built in **Next.js (App Router) + TypeScript + Redux Toolkit**. Actively evolving toward a cloud‑ready, microservices architecture (Gateway + presigned S3 uploads + evented backend).

---

## TL;DR

- **Today (dev mode):** drag‑and‑drop folders/files into a local `uploads/` root; list, breadcrumb, and size/modified metadata via API route handlers.
- **Tomorrow (cloud mode):** Spring Cloud Gateway in front of services (Auth, Drive/Metadata, File Service for presign, Billing, Notifier/Audit). Direct‑to‑S3 uploads with presigned URLs, Drive service attaches metadata, events on **SNS/SQS** (or Kafka), observability with **OpenTelemetry**.

> The web app already points to a gateway origin via `NEXT_PUBLIC_GATEWAY_ORIGIN` and stubs OIDC start URLs.

---

## ✨ Features

- **Recursive folder & multi‑file drag‑and‑drop** (preserves nested structure).
- **Empty folder support** via `.folder` marker (keeps trees intact).
- **Safe path handling** on server (`safeResolve`/`safeJoin`) to prevent traversal.
- **Breadcrumb navigation** and global path state with **Redux Toolkit** (`currentPath` slice).
- **Directory listing API** aggregates folder **size** (descendants) + **lastModified**.
- **Storage usage** bar with human‑readable units.
- **Auth flow placeholders**: login/register pages, middleware redirect to `/login` when session is missing, and OIDC start links (via Gateway).
- **Modern UI**: **Tailwind CSS + DaisyUI** theme, shadcn‑style buttons, **Framer Motion** bits (Animated Storage bar, starfield hero on marketing page).

---

## 🧩 Tech Stack

- **Next.js** (App Router, Route Handlers, `runtime: "nodejs"`)
- **TypeScript**
- **Redux Toolkit** (typed hooks, `currentPath` slice)
- **Tailwind CSS** + **DaisyUI** (custom theme in `globals.css`)
- **React Icons** / shadcn‑style button utility
- **Framer Motion** (select components/marketing)

**Platform (planned/in flight):**

- **Spring Cloud Gateway** (JWT verification via OIDC/JWK, routing/rate‑limits, 302 to presigned URLs; optional CloudFront)
- **Auth Service** (Node.js + Express, OIDC start endpoints)
- **File Service** (Python + Flask) → issues presigned S3 URLs (upload/download)
- **Drive/User Profile** (Java + Spring Boot + Neon Postgres) → stores file/folder metadata
- **Billing** (C# + ASP.NET Core + Firestore)
- **Notifier/Audit worker** (Python) → reacts to file events
- **Event bus** via **SNS/SQS** (or Kafka) and **outbox pattern** per service
- **OpenTelemetry** for traces/logs/metrics; AWS SSM/Secrets Manager for secrets

---

## 🚀 Getting Started (Local Dev)

### 1) Prerequisites

- Node.js **18+**

### 2) Install deps

```bash
npm install
```

### 3) Create local folders & mock DB

```bash
mkdir -p uploads
mkdir -p data
# initialize database file
echo "[]" > data/mockDb.json
```

> Optional: set a custom upload root via `UPLOAD_DIR=/absolute/path/to/uploads`.

### 4) Environment

Create `.env.local` in the project root:

```ini
# Web app → where to start OIDC and where the API gateway will live (dev/prod)
NEXT_PUBLIC_GATEWAY_ORIGIN=http://localhost:8080

# Local dev storage root (defaults to ./uploads if not set)
UPLOAD_DIR=./uploads

# Session/JWT secret used by Next.js middleware (hex or raw). For hex, use 64 hex chars.
# Example (PowerShell): [Guid]::NewGuid().ToString("N") + [Guid]::NewGuid().ToString("N")
AUTH_SECRET=CHANGE_ME

# (optional) telemetry
# OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

### 5) Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ How It Works (Dev Mode)

### Client flow (drag & drop)

- `RecentFiles.tsx` handles file/folder drops using the File System API (`webkitGetAsEntry`).
- `utils/FileSystemUtils.ts` provides:

  - `walkEntry(entry, parentPath, into)` → converts dropped items to a tree of `FileFolderBuffer`.
  - `splitBuffers(nodes)` → flattens that tree into:

    - `files: { file: File; relPath: string }[]`
    - `emptyFolders: string[]` (so empty dirs can be created server‑side)

- A `FormData` is POSTed to **`/api/upload`**:

  - Each **file** is appended with a **filename that includes its relative path** (e.g. `photos/2024/trip/a.jpg`).
  - **Empty folders** are sent as JSON under the `folders` key.

- After upload, the UI re‑fetches the current directory.

### Navigation state (Redux)

- `features/currentPath/currentPathSlice.ts`:

  - State: `{ path: string }` (`""` represents the root)
  - Actions: `setPath`, `enterFolder`, `upDir`, `resetPath`
  - Selector: `selectCurrentPath`

- Registered in `store/store.ts`; provider in `app/layout.tsx`.

### Directory listing & metadata

- **`GET /api/files?path=<rel>`**

  - Normalizes and verifies path stays **inside `UPLOAD_ROOT`**.
  - Returns **files** for the folder and **immediate subfolders** discovered via disk + DB.
  - For each folder, aggregates **total size** (descendants) and **lastModified`**.

---

## 🔌 API (Dev Mode)

### `GET /api/files?path=<relPath>`

**Response shape**

```ts
export type FileSize = {
  raw: number;
  value: number;
  unit: "B" | "KB" | "MB" | "GB" | "TB";
};

export type FileType = {
  name: string;
  owner: string;
  size: FileSize;
  type: string;
  lastModified: number; // epoch ms
  path: string; // folder prefix ending with "/" or ""
};

export type FolderType = {
  name: string; // e.g. "Pictures/"
  path: string; // parent path prefix
  owner: string;
  size: FileSize;
  lastModified: number; // epoch ms
};

export type ExistingDirectoryType = {
  ok: boolean;
  path: string; // normalized request path ('' = root)
  folders: FolderType[];
  files: FileType[];
};
```

**Notes**

- Request `path` is normalized (no leading slash; trailing slash included when non‑empty).
- Immediate subfolders come from disk (`readdir`) **and** DB scan, then merged/uniqued.

### `POST /api/upload`

**FormData keys**

- `files`: multiple file parts; **filename embeds the relative path** (e.g. `docs/readme.txt`).
- `folders`: JSON array of empty folders to create.

**Response**

```json
{
  "ok": true,
  "createdFolders": ["photos/2024/empty/"],
  "saved": ["photos/2024/trip/a.jpg"]
}
```

**Server details**

- `safeJoin()` keeps writes **inside** `UPLOAD_ROOT`.
- Empty folders touch a `.folder` sentinel for timestamps.
- File metadata normalized via `getNormalizedSize()` and merged into `data/mockDb.json`.

> **Heads‑up:** These routes are **temporary** for local dev. Cloud mode will switch to Gateway + presigned S3.

---

## 🌐 API (Planned Gateway Routes)

- `GET /drive/list?p=<path>` – list directory contents from Drive service
- `POST /files/presign-batch` – obtain S3 form fields/URLs for direct uploads
- `POST https://<bucket>.s3.amazonaws.com` – **browser uploads directly to S3**
- `POST /drive/attach-batch` – commit metadata (checksums, sizes, owners, paths)
- `GET /files/presign-download?id=...` – time‑limited download URL
- `GET /auth/oidc/start?screen_hint=login|signup` – begin OIDC flow via Gateway

**Pattern**: presign → client uploads to S3 → client calls Drive to attach metadata → events emitted (`FileUploaded`, `FileDeleted`, ...).

---

## 🧠 Key Modules

- `utils/FileSystemUtils.ts` — drop traversal & flattening (`walkEntry`, `readAllEntries`, `splitBuffers`)
- `utils/NormalizedSize.ts` — bytes → `{ raw, value, unit }`
- `utils/FileDb.ts` — JSON DB (`data/mockDb.json`)
- `app/api/files/route.ts` — safe read + folder aggregation
- `app/api/upload/route.ts` — safe write + `.folder` markers + DB merge
- `middleware.ts` — public route allow‑list, session check, redirect to `/login`
- `components/*` — `DashboardContentSection`, `RecentFiles`, `Breadcrumbs`, `StorageUsage`, sidebar pieces, marketing pages, auth forms

---

## 🧭 UI Notes

- **Dashboard** shows total storage used (default max **100 MB** → tweak in `StorageUsage`).
- **Breadcrumbs** allow quick jumps and reset to root.
- **Marketing** page includes starfield hero + CTA.
- **Auth pages** (login/register) live under `/login` and `/register` and link to Gateway OIDC start URLs.

---

## 🛡️ Security & Safety

- **Path traversal protection** on read/write (`safeResolve`, `safeJoin`).
- All operations constrained to `UPLOAD_ROOT` (defaults to `./uploads`).
- Route handlers use **`runtime: "nodejs"`**; middleware enforces session presence on private paths.
- Client keeps raw `File`/`Blob` out of Redux — global state holds only metadata and path.

---

## ⚠️ Limitations (Current Prototype)

- No auth or per‑user namespaces in local mode.
- No delete/rename/move endpoints yet.
- Folder drag‑and‑drop relies on `webkitGetAsEntry` (best in Chromium).
- Not optimized for very large directories (pagination/virtualization TBD).

---

## 🔮 Roadmap

- RTK Query for directory caching & background refetch
- Delete / rename / move APIs + optimistic UI
- URL ↔︎ state sync (`?p=...`) for shareable deep links
- Chunked uploads with progress, pause/resume, cancellation
- Auth + per‑user `UPLOAD_ROOT` namespaces
- Trash + restore flow; starred items, tags, filters
- File previews (images, PDFs, text) in side panel; drag‑select + keyboard shortcuts
- Server‑side checksums & optional deduplication
- Shareable time‑limited links; audit trail & notifications
- Unit tests (Vitest/Jest) + Playwright E2E
- Observability: OpenTelemetry traces/logs; structured logging everywhere

---

## 🏗️ CI/CD & Containers (WIP)

- **Branch:** `GitHubActionsAndDockerizing` contains Dockerfiles and initial GitHub Actions workflow.
- CI will run typecheck/lint/build on push/PR; image builds are planned.
- Production target: Next.js build → static + server output; deploy behind Gateway/CloudFront.

---

## 🧱 Project Structure (excerpt)

```
app/
  api/
    files/route.ts       # GET listing (dev)
    upload/route.ts      # POST upload (dev)
  layout.tsx             # wraps with <StoreProvider/>
  page.tsx               # home/marketing entry
  (auth)/
    login/page.tsx
    register/page.tsx
components/
  Breadcrumbs.tsx
  DashboardContentSection.tsx
  RecentFiles.tsx
  ReplaceModal.tsx
  StorageUsage.tsx
  MainSidebar.tsx
  marketing/*            # Navbar, Hero (starfield), FeatureCards, etc.
features/
  currentPath/currentPathSlice.ts
store/
  store.ts
  StoreProvider.tsx
utils/
  FileSystemUtils.ts
  NormalizedSize.ts
  FileDb.ts
  FileSizes.ts
  utils.ts
middleware.ts
types/
  ExistingDirectory.ts
  File.ts
  FileFolderBuffer.ts
  Folder.ts
uploads/                # created at runtime
data/
  mockDb.json
```

---

## 🏁 Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Contributing

Trunk‑based with short‑lived feature branches works well here. Branch, commit small, open a PR, let CI run, merge.

---

## Notes

- If your browser doesn’t support folder drag‑and‑drop APIs, uploads may degrade to single files.
- If `AUTH_SECRET` is hex, ensure it’s **64 hex chars** (32 bytes). For non‑hex, any reasonably long random string works.
