import { FileType } from "./File";
import { FolderType } from "./Folder";

export type ExistingDirectoryType = {
  ok: boolean;
  path: string;
  folders: FolderType[];
  files: FileType[];
};
