const { getAllFilesAndFolders } = require("../services/files.services");

async function getFilesFoldersInGivenPath(req, res) {
  const path = req.query.path || "";
  const ownerId = req.headers["x-user-id"];

  try {
    const filesFolders = await getAllFilesAndFolders(path, ownerId);

    if (filesFolders.length === 0) {
      return res.status(200).json({
        path,
        message: `No files or folders in ${path}`,
        folders: [],
        files: [],
      });
    }

    const folders = filesFolders.filter((node) => node.type === "folder");
    const files = filesFolders.filter((node) => node.type === "file");

    const filesFoldersCount = filesFolders.length;

    return res.status(200).json({
      path,
      folders: folders.map((folder) => ({
        name: folder.name,
        path: folder.path,
      })),
      files: files.map((file) => ({
        name: file.name,
        size: { raw: file.bytes },
        lastModified: file.updatedAt?.getTime() || null,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      message: `Internal Server Error`,
      error: `${err.message}`,
    });
  }
}

module.exports = { getFilesFoldersInGivenPath };
