import { FileSize } from "./File";

export type FolderType = {
  name: string;
  path: string;
  owner?: string;
  size: FileSize;
  lastModified?: number;
};
