import { FileFolderBuffer, FlatFile } from "../types/FileFolderBuffer";

const entryToFile = (fileEntry: any) =>
  new Promise<File>((resolve, reject) => fileEntry.file(resolve, reject));

const readAllEntries = (reader: any) =>
  new Promise<any[]>((resolve, reject) => {
    const out: any[] = [];
    const read = () =>
      reader.readEntries(
        (batch: any[]) => {
          if (batch.length === 0) resolve(out);
          else {
            out.push(...batch);
            read();
          }
        },
        (err: any) => reject(err)
      );
    read();
  });

export const walkEntry = async (
  entry: any,
  parentPath: string,
  into: FileFolderBuffer[]
) => {
  if (entry.isFile) {
    const file = await entryToFile(entry);
    into.push({
      file,
      folder: null,
      path: parentPath,
      buffer: null,
    });
  } else if (entry.isDirectory) {
    const dirNode: FileFolderBuffer = {
      file: null,
      folder: entry.name,
      path: parentPath,
      buffer: [],
    };
    into.push(dirNode);

    const reader = entry.createReader();
    const children = await readAllEntries(reader);
    for (const child of children) {
      await walkEntry(child, `${parentPath}${entry.name}/`, dirNode.buffer!);
    }
  }
};

export function splitBuffers(
  nodes: FileFolderBuffer[],
  base = ""
): {
  files: FlatFile[];
  emptyFolders: string[];
} {
  const files: FlatFile[] = [];
  const emptyFolders: string[] = [];

  const walk = (list: FileFolderBuffer[], currBase: string) => {
    for (const node of list) {
      if (node.file) {
        const relPath = (node.path || "/")
          .replace(/^\/+/, "")
          .replace(/\\/g, "/");
        files.push({ file: node.file, relPath: relPath ? relPath : "" });
      } else if (node.folder) {
        const folderPath = (currBase + node.folder + "/").replace(/\\/g, "/");
        const children = node.buffer ?? [];
        if (children.length === 0) {
          emptyFolders.push(folderPath);
        } else {
          walk(children, folderPath);
        }
      }
    }
  };

  walk(nodes, base);
  return { files, emptyFolders };
}
