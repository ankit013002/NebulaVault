"use client";

import React, { useEffect, useState } from "react";
import StorageUsage from "./StorageUsage";
import RecentFiles from "./RecentFiles";
import { FileSize, FileType } from "@/types/File";
import { getNormalizedSize } from "@/utils/NormalizedSize";
import { FileFolderBuffer } from "@/types/FileFolderBuffer";
import { splitBuffers } from "@/utils/FileSystemUtils";
import { ExistingDirectoryType } from "@/types/ExistingDirectory";

const DashboardContentSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalStorageOccupied, setTotalStorageOccupied] =
    useState<FileSize | null>(null);
  const [currPath, setCurrPath] = useState("");
  const [existingDirectoryItems, setExistingDirectoryItems] =
    useState<ExistingDirectoryType | null>(null);

  useEffect(() => {
    const updateFiles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/files?path=${encodeURIComponent(currPath)}`,
          {
            method: "GET",
          }
        );
        const data: ExistingDirectoryType = await res.json();
        console.log(data);
        setExistingDirectoryItems(data);
        updateTotalStorageOccupied(data);
      } catch (e) {
        console.log("Error: ", e);
      } finally {
        setIsLoading(false);
      }
    };

    updateFiles();
  }, [currPath]);

  const updateTotalStorageOccupied = (dirNode: ExistingDirectoryType) => {
    let accumulatingSum = 0;
    dirNode.folders.forEach((folder) => (accumulatingSum += folder.size.raw));
    dirNode.files.forEach((file) => {
      accumulatingSum += file.size.raw;
    });
    setTotalStorageOccupied(getNormalizedSize(accumulatingSum));
  };

  const uploadFiles = async (items: FileFolderBuffer[]) => {
    console.log("Items: ", items);
    const { files, emptyFolders } = splitBuffers(items);
    console.log("Files: ", files);
    console.log("Folders: ", emptyFolders);

    const formData = new FormData();

    for (const { file, relPath } of files) {
      const filenameWithPath = `${relPath}${file.name}`;
      formData.append("files", file, filenameWithPath);
    }

    if (emptyFolders.length > 0) {
      formData.append(
        "folders",
        new Blob([JSON.stringify(emptyFolders)], { type: "application/json" }),
        "folders.json"
      );
    }

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
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
          uploadFiles={(f: FileFolderBuffer[]) => uploadFiles(f)}
          setCurrPath={(path) => setCurrPath(path)}
        />
      </div>
    </>
  );
};

export default DashboardContentSection;
