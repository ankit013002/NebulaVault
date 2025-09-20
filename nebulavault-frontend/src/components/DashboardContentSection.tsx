"use client";

import React, { useEffect, useState } from "react";
import StorageUsage from "./StorageUsage";
import RecentFiles from "./RecentFiles";
import { FileSize, FileType } from "@/types/File";
import { getNormalizedSize } from "@/utils/NormalizedSize";
import { FileFolderBuffer } from "@/types/FileFolderBuffer";
import { splitBuffers } from "@/utils/FileSystemUtils";

const DashboardContentSection = () => {
  const [dirItems, setDirItems] = useState<FileFolderBuffer>({
    file: null,
    folder: "root",
    path: "",
    buffer: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalStorageOccupied, setTotalStorageOccupied] =
    useState<FileSize | null>(null);

  useEffect(() => {
    const updateFiles = async () => {
      const res = await fetch("/api/files", {
        method: "GET",
      });
      const resjson = await res.json();
      const data = resjson.files as FileFolderBuffer;
      // updateTotalStorageOccupied(data);
      setDirItems((prevData) => {
        setIsLoading(false);
        return data;
      });
    };
    setIsLoading(true);
    updateFiles();
  }, []);

  const updateTotalStorageOccupied = (files: FileType[]) => {
    let accumulatingSum = 0;
    files.forEach((file) => {
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

    // // Optional: manifest for your own metadata (can also be derived server-side)
    // const manifest = files.map(({ file, relPath }) => ({
    //   name: file.name,
    //   type: file.type,
    //   lastModified: file.lastModified,
    //   size: file.size,
    //   path: relPath,
    // }));
    // formData.append(
    //   "manifest",
    //   new Blob([JSON.stringify(manifest)], { type: "application/json" }),
    //   "manifest.json"
    // );

    // POST to your API
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    // Optionally refetch directory listing after upload
    // ...
  };

  return (
    <>
      <div>
        <StorageUsage totalStorageOccupied={totalStorageOccupied} />
      </div>
      <div className="h-full">
        <RecentFiles
          isLoading={isLoading}
          existingDirItems={dirItems}
          uploadFiles={(f: FileFolderBuffer[]) => uploadFiles(f)}
        />
      </div>
    </>
  );
};

export default DashboardContentSection;
