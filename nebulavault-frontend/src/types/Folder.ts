import { FileSizeUnit, FileType } from "./File";

export type FolderSize = {
  raw: number;
  value: number;
  units: FileSizeUnit;
};

export type FolderType = {
  name: string;
  folders: FolderType[];
  files: FileType[];
  size: FolderSize;
  path: string;
};
