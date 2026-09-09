import { FileSize } from "./File";

export type FolderType = {
  /** DriveNode id, used to address the folder for delete. */
  id: string;
  name: string;
  path: string;
  owner?: string;
  size: FileSize;
  lastModified?: number;
};
