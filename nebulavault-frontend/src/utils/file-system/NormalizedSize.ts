import { FileSize, FileSizeUnit } from "@/types/File";
import { FileSizeUnits } from "./FileSizes";

export function getNormalizedSize(bytes: number): FileSize {
  let index = 0;
  let unit = FileSizeUnits[index];
  const rawSize = bytes;
  let size = bytes;

  console.log(bytes);

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

export function sizeConversion(
  value: number,
  fromSize: FileSizeUnit,
  toSize: FileSizeUnit
) {
  const fromSizeIndex = FileSizeUnits.indexOf(fromSize);
  const toSizeIndex = FileSizeUnits.indexOf(toSize);

  console.log("HERE");

  if (fromSizeIndex < 0 || toSizeIndex < 0 || fromSizeIndex >= toSizeIndex) {
    return {
      raw: -1,
      value: -1,
      unit: "ERROR",
    };
  }

  console.log("HERE");

  const size = value / Math.pow(1024, toSizeIndex - fromSizeIndex);
  const rawSize = getBytes(size, toSizeIndex);

  console.log(size);
  console.log(rawSize);

  return {
    raw: rawSize,
    value: Number(size.toFixed(2)),
    unit: toSize,
  };
}

function getBytes(value: number, toSizeIndex: number) {
  const size = value * Math.pow(1024, toSizeIndex);
  return size;
}
