# Nebula Vault

A minimal, local‑first file manager built with **Next.js (App Router) + TypeScript + Redux Toolkit**.

- Drag & drop whole folders or files, preserving sub‑folder structure
- Browse with breadcrumb navigation powered by Redux
- Files stored under a server‑side `uploads/` root; metadata lives in `data/mockDb.json`

---

## ✨ Features

- **Drag & drop uploads** of multiple files and folders (recursive).
- **Empty folder support** via a `.folder` marker (keeps directory trees intact).
- **Safe path handling** to prevent traversal outside the upload root.
- **Breadcrumb navigation** and global path state via **Redux Toolkit** (`currentPath` slice).
- **Directory listing API** with aggregated folder size and last‑modified.
- **Storage usage** bar with human‑readable units.

---

## 🧩 Tech Stack

- **Next.js** (App Router, Route Handlers, `runtime: "nodejs"`)
- **TypeScript**
- **Redux Toolkit** (typed hooks + `currentPath` slice)
- **Tailwind CSS** + **DaisyUI** (custom theme in `globals.css`)
- **React Icons** / shadcn‑style button utility

---

## 🚀 Getting Started

### 1) Prerequisites

- Node.js **18+**

### 2) Install deps

```bash
npm install
```

### 3) Create folders & mock DB

```bash
mkdir -p uploads
mkdir -p data
# initialize database file
echo "[]" > data/mockDb.json
```

> Optional: set a custom upload root via `UPLOAD_DIR=/absolute/path/to/uploads`.

### 4) Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ How It Works

### Client flow (drag & drop)

- `RecentFiles.tsx` handles file/folder drops using the browser File System API (`webkitGetAsEntry`).
- `utils/FileSystemUtils.ts` provides:

  - `walkEntry(entry, parentPath, into)` → converts dropped items to a tree of `FileFolderBuffer`.
  - `splitBuffers(nodes)` → flattens that tree into:

    - `files: { file: File; relPath: string }[]`
    - `emptyFolders: string[]` (so empty dirs can be created server‑side)

- A `FormData` payload is POSTed to `/api/upload`:

  - Each **file** is appended with a **filename that includes its relative path** (e.g. `photos/2024/trip/a.jpg`).
  - **Empty folders** are sent as a JSON part under the `folders` key.

- After upload, the UI re‑fetches the current directory.

### Navigation state (Redux)

- `features/currentPath/currentPathSlice.ts`:

  - State: `{ path: string }` (`""` represents the root)
  - Actions: `setPath`, `enterFolder`, `upDir`, `resetPath`
  - Selector: `selectCurrentPath`

- Registered in `store/store.ts` → `currentPath` state key.
- `StoreProvider.tsx` wraps the app in `app/layout.tsx` to provide the Redux store globally.

### Directory listing & metadata

- `GET /api/files?path=<rel>`

  - Normalizes and verifies path stays inside `UPLOAD_ROOT`.
  - Returns **files** for the folder and **immediate subfolders** discovered via both disk and DB.
  - For each folder, aggregates: total **size** (descendants) and **lastModified**.

---

## 🔌 API

### `GET /api/files?path=<relPath>`

**Response shape**:

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

Notes:

- Request `path` is normalized (no leading slash; trailing slash included when non‑empty).
- Immediate subfolders come from disk (`readdir`) **and** DB scan, then merged/uniqued.

---

### `POST /api/upload`

**FormData** keys:

- `files`: multiple parts; **filename must embed the relative path** (e.g. `docs/readme.txt`).
- `folders`: JSON array of empty folders to create (can be a string part or a `File` part).

**Response**:

```json
{
  "ok": true,
  "createdFolders": ["photos/2024/empty/"],
  "saved": ["photos/2024/trip/a.jpg"]
}
```

Server details:

- `safeJoin()` ensures writes remain **inside** `UPLOAD_ROOT`.
- Empty folders get a `.folder` file (touched for timestamps) so they exist on disk.
- File metadata is normalized with `getNormalizedSize()` and merged into `data/mockDb.json`.

---

## 🧠 Key Modules

- **`utils/FileSystemUtils.ts`** — drop traversal & flattening

  - `walkEntry` and `readAllEntries` (recursive directory reading)
  - `splitBuffers` (files + empty folder list)

- **`utils/NormalizedSize.ts`** — bytes → `{ raw, value, unit }`
- **`utils/FileDb.ts`** — JSON DB (`data/mockDb.json`)
- **`app/api/files/route.ts`** — safe read, folder aggregation
- **`app/api/upload/route.ts`** — safe write, `.folder` markers, DB merge

---

## 🧭 UI Components (selection)

- `DashboardContentSection.tsx` — fetches current folder + computes total storage used
- `RecentFiles.tsx` — drag\&drop surface, list/grid, replace‑modal when collisions are detected
- `Breadcrumbs.tsx` — renders the current path and allows jumping up the tree (reset button included)
- `StorageUsage.tsx` — progress bar; default max is **100MB** (tweak `MAX`)
- Sidebar: `MainSidebar`, `SideBarMenuOptions`, `SideBarMenuOption`, `SideBarTitleSection`

---

## 🧱 Project Structure (excerpt)

```
app/
  api/
    files/route.ts      # GET listing
    upload/route.ts     # POST upload
  layout.tsx            # wraps with <StoreProvider/>
  page.tsx              # home entry
components/
  Breadcrumbs.tsx
  DashboardContentSection.tsx
  RecentFiles.tsx
  ReplaceModal.tsx
  StorageUsage.tsx
  MainSidebar.tsx
features/
  currentPath/
    currentPathSlice.ts
store/
  store.ts
  StoreProvider.tsx
utils/
  FileSystemUtils.ts
  NormalizedSize.ts
  FileDb.ts
  FileSizes.ts
  utils.ts
types/
  ExistingDirectory.ts
  File.ts
  FileFolderBuffer.ts
  Folder.ts
uploads/
  ... (created at runtime)
data/
  mockDb.json
```

---

## 🛡️ Security & Safety

- **Path traversal protection** on read & write (`safeResolve`, `safeJoin`).
- All operations constrained to `UPLOAD_ROOT` (defaults to `./uploads`).
- Route handlers use **`runtime: "nodejs"`**.

---

## ⚠️ Limitations

- No auth or per‑user isolation (prototype only).
- No delete/rename/move endpoints yet.
- Drag‑and‑drop folder reading relies on `webkitGetAsEntry` (best in Chromium).
- Client keeps raw `File`/`Blob` objects **out of Redux** — only metadata and path in global state.

---

## 🔮 Upcoming Features

- [ ] Delete files / folders
- [ ] Download files / folders
- [ ] Rename / move actions with optimistic UI
- [ ] File previews (images, PDFs, text) in a side panel
- [ ] Drag-select and keyboard shortcuts (select all, rename, delete)
- [ ] Upload progress, pause/resume, and cancellation
- [ ] URL ↔ state sync (`?p=...`) for deep links
- [ ] RTK Query for directory caching & background refetch
- [ ] Pagination/virtualization for very large folders
- [ ] Trash + restore flow
- [ ] Starred items, tags, and filters
- [ ] Auth & per-user namespaces for `UPLOAD_ROOT`
- [ ] Unit tests (Vitest/Jest) and Playwright E2E
- [ ] Shareable file links (time-limited, signed)
- [ ] Collision dialog enhancements (merge/replace/skip per item)
- [ ] Server-side checksums & optional deduplication

## 🗺️ Roadmap

- RTK Query for directory caching & background refetch
- Delete / rename / move APIs + optimistic UI
- URL ↔︎ state sync (`?p=...`) for shareable deep links
- Chunked uploads with progress & cancellation
- Auth + per‑user `UPLOAD_ROOT` namespaces

---

## 🏁 Scripts (typical)

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

> Adjust to your `package.json` if different.
