import { FileSize } from "@/types/File";
import React from "react";

interface StorageUsageProps {
  totalStorageOccupied: FileSize | null;
}

const StorageUsage = ({ totalStorageOccupied }: StorageUsageProps) => {
  console.log(totalStorageOccupied);

  return (
    <div className="bg-[#13161c] py-5 px-2 rounded-2xl flex flex-col gap-2">
      <div>Storage Usage</div>
      <div className="relative h-2">
        <div className="absolute rounded-2xl w-full h-2 bg-[#23242b]"></div>
        <div className="absolute rounded-2xl w-[50%] h-2 bg-[#2161cf]"></div>
        <div className="absolute w-2 h-2 left-[49.5%] flex items-center justify-center">
          <div className="absolute w-1 h-1 rounded-full bg-[#06b6d4] blur-xl opacity-60 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_15px_10px_#06b6d4]"></div>
        </div>
      </div>
      <div className="flex justify-between">
        {totalStorageOccupied != null ? (
          <div>
            {totalStorageOccupied?.value} {totalStorageOccupied?.unit}
          </div>
        ) : (
          <div>0 B</div>
        )}
        <div>of 200 GB</div>
      </div>
    </div>
  );
};

export default StorageUsage;
