import { FileType } from "./File";

export type ExistingDirectoryType = {
  ok: boolean;
  path: string;
  folders: string[];
  files: FileType[];
};
