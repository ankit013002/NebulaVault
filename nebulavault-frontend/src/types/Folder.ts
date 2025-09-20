import { FileSize, FileSizeUnit, FileType } from "./File";

export type FolderSize = {
  raw: number;
  value: number;
  units: FileSizeUnit;
};

export type FolderType = {
  name: string;
  path: string;
  owner: string;
  size: FileSize;
  lastModified: number;
};
