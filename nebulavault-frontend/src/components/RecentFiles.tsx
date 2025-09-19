"use client";

import { FileType } from "@/utils/MockFiles";
import { stat } from "fs";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";

const RecentFiles = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replaceFiles, setReplaceFiles] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    const updateFiles = async () => {
      const res = await fetch("/api/files", {
        method: "GET",
      });
      const resjson = await res.json();
      const data = resjson.files;
      console.log(data);
      setFiles((prevData) => {
        setIsLoading(false);
        return data;
      });
    };
    setIsLoading(true);
    updateFiles();
  }, []);

  // const downloadFile = async () => {
  //   if (!file) {
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   setStatus("Uploading...");

  //   try {
  //     const res = await fetch("/api/upload", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const data = await res.json();
  //     console.log(data);
  //     setStatus("Upload Complete");
  //   } catch (e) {
  //     console.error(e);
  //     setStatus("Upload Failed");
  //   }

  //   // console.log("HERE");
  //   // const url = URL.createObjectURL(file);
  //   // const link = document.createElement("a");
  //   // link.href = url;
  //   // link.download = file.name;
  //   // link.click();
  //   // URL.revokeObjectURL(url);
  // };

  const areFilesBeingReplaced = (newFiles: File[]) => {
    const buffer: string[] = [];

    newFiles
      .filter((file) => files.find((f) => f.name === file.name))
      .map((file) => buffer.push(file.name));

    setReplaceFiles(buffer);
    setPendingFiles(newFiles);

    return buffer.length > 0;
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length == 0) {
      return;
    }

    const anyReplacements = areFilesBeingReplaced(files);
    if (!anyReplacements) {
      await actuallyUpload(files);
    }
  };

  const actuallyUpload = async (files: File[]) => {
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

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const buffer: File[] = [];
    setIsDragging(false);
    console.log(e.dataTransfer.items);
    const items = [...e.dataTransfer.items];
    items.forEach((item, index) => {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          buffer.push(file);
        }
      }
    });

    uploadFiles(buffer);
  };

  const showDbStatus = async () => {};

  const handleCancelReplace = () => {
    setReplaceFiles([]);
  };

  const handleConfirmReplace = async () => {
    actuallyUpload(pendingFiles);
    setReplaceFiles([]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => setIsDragging(false)}
      onDragEnd={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onMouseLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        handleDragDrop(e);
      }}
      className="relative h-full"
    >
      {replaceFiles.length > 0 ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#181922] rounded-2xl shadow-2xl w-[90%] max-w-md p-6 flex flex-col gap-4 animate-fade-in">
            <div className="text-center text-xl font-semibold text-white">
              Replace Files?
            </div>
            <div className="bg-[#1f2029] rounded-lg p-3 max-h-40 overflow-y-auto text-sm text-gray-300">
              {replaceFiles.map((file) => (
                <div
                  key={file}
                  className="border-b border-gray-700 py-1 last:border-none"
                >
                  {file}
                </div>
              ))}
            </div>
            <div className="flex w-full justify-end gap-3">
              <button
                className="btn btn-secondary px-5"
                onClick={() => handleCancelReplace()}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-5"
                onClick={() => handleConfirmReplace()}
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : isDragging ? (
        <div className="w-full h-full border-dashed border-2 flex justify-center items-center">
          <FaPlus className="text-5xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 h-full">
          <div className="text-2xl font-medium">Recent Files</div>
          <div className="bg-[#181922] rounded-2xl flex flex-col p-0">
            <div className="grid grid-cols-4 border-1 border-[#1d1d25] rounded-t-2xl p-2 text-lg font-medium">
              <div>Name</div>
              <div>Owner</div>
              <div>Last Modified</div>
              <div>File Size</div>
            </div>
            {files.map((file, index) => (
              <div
                key={file.name}
                className="grid grid-cols-4 border-1 border-[#1d1d25] p-2 items-center"
              >
                <div>{file.name}</div>
                <div>{file.owner}</div>
                <div>{new Date(file.lastModified).toLocaleString()}</div>
                <div>{file.size}</div>
              </div>
            ))}
            <div className="border-2 border-[#1d1d25] rounded-b-2xl p-2">
              <div className="text-sm">
                <span>{files.length}</span>
                <span>{" files"}</span>
              </div>
            </div>
          </div>
          <button className="btn" onClick={() => showDbStatus()}>
            Status
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentFiles;
