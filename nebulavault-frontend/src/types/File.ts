export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

export type FileSize = {
  raw: number;
  value: number;
  unit: FileSizeUnit;
};

export type FileType = {
  /** DriveNode id, used to address the file for download and delete. */
  id: string;
  name: string;
  owner?: string;
  size: FileSize;
  type?: string;
  lastModified?: number;
  path: string;
  /** False while an upload is reserved but its bytes have not landed yet. */
  hasContent?: boolean;
};
