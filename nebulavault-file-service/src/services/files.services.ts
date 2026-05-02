const DriveNode = require("../models/driveNode.model");

async function getAllFilesAndFolders(path, ownerId) {
  const filesAndFolders = await DriveNode.find({
    ownerId,
    path,
    isDeleted: false,
  }).sort({ type: 1, nameLower: 1 });

  return filesAndFolders;
}

module.exports = { getAllFilesAndFolders };
