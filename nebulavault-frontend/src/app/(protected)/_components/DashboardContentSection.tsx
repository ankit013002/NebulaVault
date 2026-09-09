"use client";

import React, { useCallback, useEffect, useState } from "react";
import StorageUsage from "./StorageUsage";
import RecentFiles from "./RecentFiles";
import { FileSize, FileType } from "@/types/File";
import { getNormalizedSize } from "@/utils/file-system/NormalizedSize";
import { FileFolderBuffer } from "@/types/FileFolderBuffer";
import { splitBuffers } from "@/utils/file-system/FileSystemUtils";
import { ExistingDirectoryType } from "@/types/ExistingDirectory";
import { useRouter, useParams } from "next/navigation";
import { FolderType } from "@/types/Folder";
import {
  UploadProgress,
  deleteNode,
  downloadFile,
  uploadFiles,
} from "@/utils/file-system/uploadFiles";

interface ListedFile {
  id: string;
  name: string;
  path: string;
  bytes: number;
  contentType?: string;
  ext?: string;
  lastModified: number | null;
  hasContent: boolean;
}

interface ListedFolder {
  id: string;
  name: string;
  path: string;
  bytes: number;
  lastModified: number | null;
}

export default function DashboardContentSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [totalStorageOccupied, setTotalStorageOccupied] =
    useState<FileSize | null>(null);
  const [existingDirectoryItems, setExistingDirectoryItems] =
    useState<ExistingDirectoryType | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams() as { path?: string[] };
  const currPath = (params?.path ?? []).join("/");

  const fetchDir = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/files?path=${encodeURIComponent(currPath)}`);
      if (!res.ok) {
        throw new Error(`Could not load this folder (${res.status})`);
      }

      const payload = (await res.json()) as {
        data?: { files?: ListedFile[]; folders?: ListedFolder[] };
      };

      const files: FileType[] = (payload.data?.files ?? []).map((file) => ({
        id: file.id,
        name: file.name,
        path: file.path,
        size: getNormalizedSize(file.bytes),
        type: file.contentType,
        lastModified: file.lastModified ?? undefined,
        hasContent: file.hasContent,
      }));

      const folders: FolderType[] = (payload.data?.folders ?? []).map((folder) => ({
        id: folder.id,
        name: folder.name,
        path: folder.path,
        size: getNormalizedSize(folder.bytes),
        lastModified: folder.lastModified ?? undefined,
      }));

      const existingDirectory: ExistingDirectoryType = {
        ok: true,
        path: currPath,
        files,
        folders,
      };

      setExistingDirectoryItems(existingDirectory);
      updateTotalStorageOccupied(existingDirectory);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setExistingDirectoryItems({ ok: false, path: currPath, files: [], folders: [] });
    } finally {
      setIsLoading(false);
    }
  }, [currPath]);

  useEffect(() => {
    fetchDir();
  }, [fetchDir]);

  const updateTotalStorageOccupied = (dirNode: ExistingDirectoryType) => {
    let accumulatingSum = 0;
    dirNode.folders.forEach((folder) => (accumulatingSum += folder.size.raw));
    dirNode.files.forEach((file) => (accumulatingSum += file.size.raw));
    setTotalStorageOccupied(getNormalizedSize(accumulatingSum));
  };

  const uploadDirItems = async (items: FileFolderBuffer[]) => {
    const { files, emptyFolders, folders } = splitBuffers(items);

    // splitBuffers reports folders as {name, path} and empty ones as full
    // paths; the API takes absolute paths for both.
    const folderPaths = [
      ...folders.map((folder) => `${folder.path}${folder.name}`),
      ...emptyFolders,
    ];

    setError(null);
    try {
      await uploadFiles(currPath, files, folderPaths, setUploadProgress);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadProgress(null);
      await fetchDir();
    }
  };

  const handleDownload = async (file: FileType) => {
    setError(null);
    try {
      await downloadFile(file.id, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    }
  };

  const handleDelete = async (nodeId: string) => {
    setError(null);
    try {
      await deleteNode(nodeId);
      await fetchDir();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const updatePath = (child: string) => {
    const next = [currPath, child].filter(Boolean).join("/");
    router.push(`/dashboard/${next}`);
  };

  return (
    <>
      <div>
        <StorageUsage totalStorageOccupied={totalStorageOccupied} />
      </div>

      {uploadProgress && (
        <div className="px-4 py-2">
          <progress
            className="progress progress-primary w-full"
            value={uploadProgress.completed}
            max={uploadProgress.total}
          />
          <p className="text-sm opacity-70">
            Uploading {uploadProgress.completed} of {uploadProgress.total}
            {uploadProgress.currentFile ? ` — ${uploadProgress.currentFile}` : ""}
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error mx-4 my-2">
          <span>{error}</span>
        </div>
      )}

      <div className="h-full">
        <RecentFiles
          isLoading={isLoading}
          existingDirItems={existingDirectoryItems}
          uploadDirItems={(f: FileFolderBuffer[]) => uploadDirItems(f)}
          updatePath={(p: string) => updatePath(p)}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
