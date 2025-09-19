import { FileSize, FileSizeUnit } from "@/types/File";
import { FileSizeUnits } from "./FileSizes";

export function getNormalizedSize(bytes: number): FileSize {
  let index = 0;
  let unit = FileSizeUnits[index];
  const rawSize = bytes;
  let size = bytes;

  while (Math.floor(size / 1024) > 0) {
    size /= 1024;
    unit = FileSizeUnits[++index];
  }

  return {
    raw: rawSize,
    value: Number(size.toFixed(2)),
    unit: unit,
  };
}
