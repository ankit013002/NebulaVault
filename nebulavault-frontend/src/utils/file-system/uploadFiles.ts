import { FlatFile } from "@/types/FileFolderBuffer";

interface UploadTarget {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresAt: string;
}

interface PresignedUpload {
  nodeId: string;
  versionId: string;
  version: number;
  name: string;
  path: string;
  key: string;
  upload: UploadTarget;
}

export interface UploadProgress {
  /** Files whose bytes have finished transferring. */
  completed: number;
  total: number;
  currentFile: string | null;
}

export interface UploadResult {
  uploaded: number;
  bytes: number;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function errorMessageFrom(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim() !== "") return message;
  }
  return fallback;
}

/**
 * Uploads a batch of files straight to object storage.
 *
 * Three steps, mirroring how the service is designed:
 *  1. ask the API to reserve versions and hand back presigned URLs,
 *  2. PUT each file's bytes directly to storage — they never pass through
 *     Next.js or the gateway, so large uploads are not bounded by a request
 *     body limit,
 *  3. tell the API which uploads landed, so it can mark them current.
 *
 * A version that is never completed stays pending and is not shown in the
 * drive, so a partial failure leaves no phantom files behind.
 */
export async function uploadFiles(
  path: string,
  files: FlatFile[],
  folderPaths: string[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  if (files.length === 0 && folderPaths.length === 0) {
    return { uploaded: 0, bytes: 0 };
  }

  // A folder containing no files is implied by nothing, so it is created
  // explicitly rather than as a side effect of an upload.
  if (files.length === 0) {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paths: folderPaths }),
    });
    if (!res.ok) {
      throw new Error(errorMessageFrom(await readJson(res), "Could not create folders"));
    }
    return { uploaded: 0, bytes: 0 };
  }

  const presignRes = await fetch("/api/files/uploads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      path,
      folderPaths,
      files: files.map(({ file, path: filePath }) => ({
        name: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
        // Absolute directory for this file, so a dropped tree keeps its shape.
        path: filePath || path,
      })),
    }),
  });

  if (!presignRes.ok) {
    throw new Error(
      errorMessageFrom(await readJson(presignRes), "Could not start the upload")
    );
  }

  const presignPayload = (await presignRes.json()) as {
    data?: { uploads?: PresignedUpload[] };
  };
  const uploads = presignPayload.data?.uploads ?? [];

  const keyOf = (dir: string, name: string): string =>
    `${dir.replace(/^\/+/, "").replace(/\/?$/, "/")}${name}`;
  const byPath = new Map(
    files.map(({ file, path: filePath }) => [keyOf(filePath || path, file.name), file])
  );
  const completedVersionIds: string[] = [];
  let bytes = 0;

  for (const [index, upload] of uploads.entries()) {
    const file = byPath.get(keyOf(upload.path, upload.name));
    if (!file) continue;

    onProgress?.({ completed: index, total: uploads.length, currentFile: upload.name });

    const putRes = await fetch(upload.upload.url, {
      method: upload.upload.method,
      headers: upload.upload.headers,
      body: file,
    });

    if (!putRes.ok) {
      throw new Error(`Upload of "${upload.name}" failed (${putRes.status})`);
    }

    completedVersionIds.push(upload.versionId);
    bytes += file.size;
  }

  onProgress?.({ completed: uploads.length, total: uploads.length, currentFile: null });

  if (completedVersionIds.length > 0) {
    const completeRes = await fetch("/api/files/uploads/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ versionIds: completedVersionIds }),
    });

    if (!completeRes.ok) {
      throw new Error(
        errorMessageFrom(await readJson(completeRes), "Could not finalise the upload")
      );
    }
  }

  return { uploaded: completedVersionIds.length, bytes };
}

/** Resolves a node to a short-lived storage URL and starts the download. */
export async function downloadFile(nodeId: string, filename: string): Promise<void> {
  const res = await fetch(`/api/files/${encodeURIComponent(nodeId)}/download`);
  if (!res.ok) {
    throw new Error(errorMessageFrom(await readJson(res), "Could not download the file"));
  }

  const payload = (await res.json()) as { data?: { url?: string } };
  const url = payload.data?.url;
  if (!url) throw new Error("No download URL was returned");

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function deleteNode(nodeId: string): Promise<void> {
  const res = await fetch(`/api/files/${encodeURIComponent(nodeId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(errorMessageFrom(await readJson(res), "Could not delete the item"));
  }
}
