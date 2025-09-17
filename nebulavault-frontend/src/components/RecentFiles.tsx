import { MockFiles } from "@/utils/MockFiles";
import React from "react";

const RecentFiles = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-2xl font-medium">Recent Files</div>
      <div className="bg-[#181922] rounded-2xl flex flex-col p-0">
        <div className="grid grid-cols-4 border-1 border-[#1d1d25] rounded-t-2xl p-2 text-lg font-medium">
          <div>Name</div>
          <div>Owner</div>
          <div>Last Modified</div>
          <div>File Size</div>
        </div>
        {MockFiles.map((file, index) => (
          <div className="grid grid-cols-4 border-1 border-[#1d1d25] p-2">
            <div>{file.name}</div>
            <div>{file.owner}</div>
            <div>{file.lastModified}</div>
            <div>
              <span>{file.fileSize}</span>
              <span>{file.fileUnits}</span>
            </div>
          </div>
        ))}
        <div className="border-2 border-[#1d1d25] rounded-b-2xl p-2">
          <div>
            <span>{MockFiles.length}</span>
            <span>{" files"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentFiles;
