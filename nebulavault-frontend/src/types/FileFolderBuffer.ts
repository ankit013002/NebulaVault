export type FlatFile = { file: File; path: string };
export type FlatFolder = { name: string; path: string };

export type FileFolderBuffer = {
  file: File | null;
  folder: string | null;
  path: string;
  buffer: FileFolderBuffer[] | null;
};
