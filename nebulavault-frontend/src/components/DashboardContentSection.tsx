"use client";

import React, { useEffect, useState } from "react";
import StorageUsage from "./StorageUsage";
import RecentFiles from "./RecentFiles";
import { FileSize, FileType } from "@/types/File";
import { getNormalizedSize } from "@/utils/NormalizedSize";

const DashboardContentSection = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalStorageOccupied, setTotalStorageOccupied] =
    useState<FileSize | null>(null);

  useEffect(() => {
    const updateFiles = async () => {
      const res = await fetch("/api/files", {
        method: "GET",
      });
      const resjson = await res.json();
      const data = resjson.files as FileType[];
      console.log("HERE");
      let accumulatingSum = 0;
      data.forEach((file) => {
        accumulatingSum += file.size.raw;
      });
      setTotalStorageOccupied(getNormalizedSize(accumulatingSum));
      console.log(data);
      setFiles((prevData) => {
        setIsLoading(false);
        return data;
      });
    };
    setIsLoading(true);
    updateFiles();
  }, []);

  const uploadFiles = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setFiles(data.files);
      console.log("Successfully Uploaded Files");
    } catch (e) {
      console.error("Upload failed", e);
    }
  };

  return (
    <>
      <div>
        <StorageUsage totalStorageOccupied={totalStorageOccupied} />
      </div>
      <div className="h-full">
        <RecentFiles
          isLoading={isLoading}
          files={files}
          uploadFiles={(f: File[]) => uploadFiles(f)}
        />
      </div>
    </>
  );
};

export default DashboardContentSection;
