"use client";

import React, { useCallback, useEffect, useState } from "react";
import StorageUsage from "./StorageUsage";
import RecentFiles from "./RecentFiles";
import { FileSize } from "@/types/File";
import { getNormalizedSize } from "@/utils/NormalizedSize";
import { FileFolderBuffer } from "@/types/FileFolderBuffer";
import { splitBuffers } from "@/utils/FileSystemUtils";
import { ExistingDirectoryType } from "@/types/ExistingDirectory";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  enterFolder,
  selectCurrentPath,
} from "@/app/features/currentPath/currentPathSlice";

const DashboardContentSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalStorageOccupied, setTotalStorageOccupied] =
    useState<FileSize | null>(null);
  const [existingDirectoryItems, setExistingDirectoryItems] =
    useState<ExistingDirectoryType | null>(null);

  const dispatch = useAppDispatch();
  const currPath = useAppSelector(selectCurrentPath);

  const fetchDir = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/files?path=${encodeURIComponent(currPath)}`,
        { method: "GET" }
      );
      const data: ExistingDirectoryType = await res.json();
      setExistingDirectoryItems(data);
      updateTotalStorageOccupied(data);
    } catch (e) {
      console.log("Error: ", e);
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
    dirNode.files.forEach((file) => {
      accumulatingSum += file.size.raw;
    });
    setTotalStorageOccupied(getNormalizedSize(accumulatingSum));
  };

  const uploadDirItems = async (items: FileFolderBuffer[]) => {
    const { files, emptyFolders } = splitBuffers(items);

    const payload = {
      files: files.map(({ file, relPath }) => ({
        name: file.name,
        path: relPath,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      })),
      emptyFolders,
    };

    const res = await fetch("/api/dev-proxy/files/presign-batch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json();

    console.log(body);

    if (!res.ok) throw new Error("Upload failed");
    await fetchDir();
  };

  const updatePath = (path: string) => {
    dispatch(enterFolder(path));
  };

  return (
    <>
      <div>
        <StorageUsage totalStorageOccupied={totalStorageOccupied} />
      </div>
      <div className="h-full">
        <RecentFiles
          isLoading={isLoading}
          existingDirItems={existingDirectoryItems}
          uploadDirItems={(f: FileFolderBuffer[]) => uploadDirItems(f)}
          updatePath={(path: string) => updatePath(path)}
        />
      </div>
    </>
  );
};

export default DashboardContentSection;
