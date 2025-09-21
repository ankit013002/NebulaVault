"use client";

import React from "react";
import { IoMdDownload } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import { FileType } from "@/types/File";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

interface FileRowProps {
  file: FileType;
}

const FileRow = ({ file }: FileRowProps) => {
  const handleFileDownload = async () => {
    const fullPath = file.path + file.name;
    const url = `/api/download?path=${encodeURIComponent(fullPath)}`;

    const res = await fetch(url);
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      console.error("Download failed:", res.status, msg);
      return;
    }

    const blob = await res.blob();
    const href = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = href;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(href);
  };

  const handleFileDelete = () => {};

  return (
    <>
      <div>{file.name}</div>
      <div>Owner</div>
      <div>{new Date(file.lastModified).toLocaleString()}</div>
      <div className="text-center">
        <span>{file.size.value + " " + file.size.unit}</span>
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
              <button onClick={() => handleFileDownload()}>
                <IoMdDownload />
              </button>
            </li>
            <li className="tooltip" data-tip="Delete">
              <button onClick={() => handleFileDelete()}>
                <FaRegTrashAlt />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default FileRow;
