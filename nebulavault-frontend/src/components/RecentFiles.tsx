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

  const uploadFiles = async (files: File[]) => {
    if (files.length == 0) {
      return;
    }

    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const files = data.files;
      setFiles(files);
      console.log("Successfully Uploaded Files");
      console.log(data.message);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
      } else {
        console.log(`Error: ${e}`);
      }
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
      className="h-full"
    >
      {isLoading ? (
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
                <div>{file.lastModified}</div>
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
