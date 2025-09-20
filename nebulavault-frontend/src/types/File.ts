export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

export type FileSize = {
  raw: number;
  value: number;
  unit: FileSizeUnit;
};

export type FileType = {
  name: string;
  owner: string;
  size: FileSize;
  type: string;
  lastModified: number;
  path: string;
};
