"use client";

import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import { FileFolderBuffer } from "@/types/FileFolderBuffer";
import { walkEntry } from "@/utils/FileSystemUtils";
import { ExistingDirectoryType } from "@/types/ExistingDirectory";
import ReplaceModal from "./ReplaceModal";
import Breadcrumbs from "./Breadcrumbs";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoMdDownload } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";

interface RecentFilesProps {
  isLoading: boolean;
  currPath: string;
  existingDirItems: ExistingDirectoryType | null;
  uploadDirItems: (f: FileFolderBuffer[]) => Promise<void>;
  updatePath: (path: string) => void;
}

const RecentFiles = ({
  isLoading,
  currPath,
  existingDirItems,
  uploadDirItems,
  updatePath,
}: RecentFilesProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [replaceFiles, setReplaceFiles] = useState<string[]>([]);
  const [pendingItems, setPendingItems] = useState<FileFolderBuffer[]>([]);

  const areFilesBeingReplaced = (dirBuffer: FileFolderBuffer[]) => {
    const buffer: string[] = [];

    console.log(dirBuffer);

    if (!existingDirItems) {
      return;
    }

    dirBuffer
      .filter((item) => {
        if (item.file) {
          return existingDirItems.files.find(
            (existingFile) => existingFile.name === item.file!.name
          );
        } else if (item.folder) {
          return existingDirItems.folders.find((existingFolder) => {
            const folderName = existingFolder.name.replace("/", "");
            console.log("CHECK");
            console.log(folderName);
            console.log(existingFolder);
            return folderName === item.folder;
          });
        }
      })
      .map((item) => {
        if (item.file) {
          buffer.push(item.file.name);
        } else if (item.folder) {
          buffer.push(item.folder);
        }
      });

    console.log("replace: ", dirBuffer);

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
      await uploadDirItems(dirNode.buffer);
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
    uploadDirItems(pendingItems);
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
        <ReplaceModal
          replaceFiles={replaceFiles}
          handleCancelReplace={() => handleCancelReplace()}
          handleConfirmReplace={() => handleConfirmReplace()}
        />
      ) : isLoading ? (
        <LoadingSpinner />
      ) : isDragging ? (
        <div className="w-full h-full border-dashed border-2 flex justify-center items-center">
          <FaPlus className="text-5xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 h-full">
          <div className="text-2xl font-medium">Recent Files</div>
          <div>
            <Breadcrumbs />
          </div>
          <div className="bg-[#181922] rounded-2xl flex flex-col p-0">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] border-1 border-[#1d1d25] rounded-t-2xl p-2 text-lg font-medium">
              <div>Name</div>
              <div>Owner</div>
              <div>Last Modified</div>
              <div className="text-center">File Size</div>
              <div className="min-w-20 text-center">Options</div>
            </div>
            {existingDirItems &&
              existingDirItems.folders.map((dirItem, index) => {
                return (
                  <div
                    onClick={() => updatePath(dirItem.name.replace("/", ""))}
                    key={index}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] border-1 border-[#1d1d25] p-2 items-center hover:cursor-pointer hover:bg-[#2a2b3a]"
                  >
                    <div>{dirItem.name.replace("/", "")}</div>
                    <div>Owner</div>
                    <div>{new Date(dirItem.lastModified).toLocaleString()}</div>
                    <div className="text-center">
                      <span>
                        {dirItem.size.value + " " + dirItem.size.unit}
                      </span>
                    </div>
                    <div className="justify-self-center min-w-20 flex justify-center items-center">
                      <div
                        className="dropdown dropdown-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button tabIndex={0} className="btn btn-ghost btn-sm ">
                          <HiOutlineDotsHorizontal />
                        </button>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box "
                        >
                          <li className="tooltip" data-tip="Download">
                            <button>
                              <IoMdDownload />
                            </button>
                          </li>
                          <li className="tooltip" data-tip="Delete">
                            <button>
                              <FaRegTrashAlt />
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            {existingDirItems &&
              existingDirItems.files.map((dirItem, index) => {
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] border-1 border-[#1d1d25] p-2 items-center"
                  >
                    <div>{dirItem.name}</div>
                    <div>Owner</div>
                    <div>{new Date(dirItem.lastModified).toLocaleString()}</div>
                    <div className="text-center">
                      <span>
                        {dirItem.size.value + " " + dirItem.size.unit}
                      </span>
                    </div>
                    <div className="justify-self-center min-w-20 flex justify-center items-center">
                      <div
                        className="dropdown dropdown-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button tabIndex={0} className="btn btn-ghost btn-sm">
                          <HiOutlineDotsHorizontal />
                        </button>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box"
                        >
                          <li className="tooltip" data-tip="Download">
                            <button>
                              <IoMdDownload />
                            </button>
                          </li>
                          <li className="tooltip" data-tip="Delete">
                            <button>
                              <FaRegTrashAlt />
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            <div className="border-2 border-[#1d1d25] rounded-b-2xl p-2">
              <div className="flex gap-2 text-sm">
                <div>
                  <span>{existingDirItems?.folders.length}</span>
                  <span>{" folders"}</span>
                </div>
                <div>
                  <span>{existingDirItems?.files.length}</span>
                  <span>{" files"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentFiles;
