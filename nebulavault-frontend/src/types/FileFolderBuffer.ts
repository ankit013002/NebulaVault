import { FolderType } from "./Folder";

export type FileFolderBuffer = {
  file: File | null;
  folder: string | null;
  path: string;
  buffer: FileFolderBuffer[] | null;
};
