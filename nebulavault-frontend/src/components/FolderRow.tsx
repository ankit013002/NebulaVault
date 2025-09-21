import React from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoMdDownload } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import { FolderType } from "@/types/Folder";

interface FolderRowProps {
  folder: FolderType;
}

const FolderRow = ({ folder }: FolderRowProps) => {
  return (
    <>
      <div>{folder.name.replace("/", "")}</div>
      <div>Owner</div>
      <div>{new Date(folder.lastModified).toLocaleString()}</div>
      <div className="text-center">
        <span>{folder.size.value + " " + folder.size.unit}</span>
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
    </>
  );
};

export default FolderRow;
