import { FileSize } from "@/types/File";
import { getNormalizedSize } from "@/utils/file-system/NormalizedSize";
import React, { useEffect, useState } from "react";

interface StorageUsageProps {
  totalStorageOccupied: FileSize | null;
}

const StorageUsage = ({ totalStorageOccupied }: StorageUsageProps) => {
  // const MAX = 1073741824; // 1GB
  const MAX = 104857600; // 100MB
  const [percentSpaceOccupied, setPercentSpaceOccupied] = useState<number>(0);
  const [maxStorageSpace, setMaxStorageSpace] = useState<FileSize | null>(null);

  useEffect(() => {
    setMaxStorageSpace(getNormalizedSize(MAX));
    if (totalStorageOccupied) {
      setPercentSpaceOccupied((totalStorageOccupied.raw / MAX) * 100);
    } else {
      setPercentSpaceOccupied(0);
    }
  }, [totalStorageOccupied]);

  return (
    <div className="bg-[#13161c] py-5 px-2 rounded-2xl flex flex-col gap-2">
      <div>Storage Usage</div>
      <div className="relative h-2">
        <div className="absolute rounded-2xl w-full h-2 bg-[#23242b]"></div>
        <div
          className={`absolute rounded-2xl h-2 bg-[#2161cf] transition-all duration-500`}
          style={{ width: `${percentSpaceOccupied}%` }}
        ></div>
        <div
          className={`absolute w-2 h-2 flex items-center justify-center transition-all duration-500`}
          style={{ left: `${percentSpaceOccupied - 0.5}%` }}
        >
          <div className="absolute w-1 h-1 rounded-full bg-[#06b6d4] blur-xl opacity-60 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_15px_10px_#06b6d4]"></div>
        </div>
      </div>
      <div className="flex justify-between">
        {totalStorageOccupied != null ? (
          <div>
            {totalStorageOccupied.value} {totalStorageOccupied.unit}
          </div>
        ) : (
          <div>0 B</div>
        )}
        {maxStorageSpace != null ? (
          <div>
            {maxStorageSpace.value} {maxStorageSpace.unit}
          </div>
        ) : (
          <div>0 B</div>
        )}
      </div>
    </div>
  );
};

export default StorageUsage;
