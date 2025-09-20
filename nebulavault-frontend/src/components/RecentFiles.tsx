"use client";

import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import { FileType } from "@/types/File";
import { FileFolderBuffer } from "@/types/FileFolderBuffer";
import { walkEntry } from "@/utils/FileSystemUtils";

interface RecentFilesProps {
  isLoading: boolean;
  existingDirItems: FileFolderBuffer;
  uploadFiles: (f: FileFolderBuffer[]) => Promise<void>;
}

const RecentFiles = ({
  isLoading,
  existingDirItems,
  uploadFiles,
}: RecentFilesProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [replaceFiles, setReplaceFiles] = useState<string[]>([]);
  const [pendingItems, setPendingItems] = useState<FileFolderBuffer[]>([]);

  const areFilesBeingReplaced = (dirBuffer: FileFolderBuffer[]) => {
    const buffer: string[] = [];

    if (!existingDirItems.buffer) {
      return;
    }

    dirBuffer
      .filter((item) => {
        if (existingDirItems.buffer == null) return;
        existingDirItems.buffer.find((existingItem) => {
          if (existingItem.file && item.file) {
            return existingItem.file.name === item.file.name;
          } else if (existingItem.folder && item.folder) {
            return existingItem.folder === item.folder;
          }
        });
      })
      .map((item) => {
        if (item.file) {
          buffer.push(item.file.name);
        } else if (item.folder) {
          buffer.push(item.folder);
        }
      });

    setReplaceFiles(buffer);
    setPendingItems(dirBuffer);
    return buffer.length > 0;
  };

  const prepareFileUpload = async (dirNode: FileFolderBuffer) => {
    if (!dirNode.buffer) {
      return;
    }

    const anyReplacements = areFilesBeingReplaced(dirNode.buffer);
    if (!anyReplacements) {
      await uploadFiles(dirNode.buffer);
    }
  };

  const handleDragDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);

    const items = [...e.dataTransfer.items];
    const rootBuffer: FileFolderBuffer = {
      file: null,
      folder: "root",
      path: "",
      buffer: [],
    };
    const root = rootBuffer.buffer;

    const promises = items.map(async (item) => {
      const entry = item.webkitGetAsEntry?.();
      if (entry && root) {
        await walkEntry(entry, "/", root);
      } else if (item.kind === "file") {
        const file = item.getAsFile();
        if (file && root) {
          root.push({
            file,
            folder: null,
            path: "/",
            buffer: null,
          });
        }
      }
    });

    await Promise.all(promises);

    prepareFileUpload(rootBuffer);
  };

  const handleCancelReplace = () => {
    setReplaceFiles([]);
  };

  const handleConfirmReplace = async () => {
    uploadFiles(pendingItems);
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
            {existingDirItems.buffer &&
              existingDirItems.buffer.map((dirItem, index) => {
                return dirItem.file ? (
                  <div
                    key={index}
                    className="grid grid-cols-4 border-1 border-[#1d1d25] p-2 items-center"
                  >
                    <div>{dirItem.file.name}</div>
                    <div>Owner</div>
                    <div>
                      {new Date(dirItem.file.lastModified).toLocaleString()}
                    </div>
                    <div>
                      <span>0 B</span>
                      {/* <span>{dirItem.file.size.value + " " + file.size.unit}</span> */}
                    </div>
                  </div>
                ) : (
                  <div key={index}>Folder</div>
                );
              })}
            <div className="border-2 border-[#1d1d25] rounded-b-2xl p-2">
              <div className="text-sm">
                {/* <span>{existingDirItems.length}</span> */}
                <span>{" files"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentFiles;
