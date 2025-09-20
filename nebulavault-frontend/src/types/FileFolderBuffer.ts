export type FlatFile = { file: File; relPath: string };

export type FileFolderBuffer = {
  file: File | null;
  folder: string | null;
  path: string;
  buffer: FileFolderBuffer[] | null;
};
