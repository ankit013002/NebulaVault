const DriveNode = require("../models/driveNode.model");

async function createDriveNodes(ownerId, nodes) {
  console.log(ownerId);

  // Need to handle empty folders
  const { files, emptyFolders } = nodes;

  const driveNodes = [];

  // TODO: What if file already exists?
  for (const file of files) {
    const driveNode = new DriveNode({
      ownerId: ownerId,
      type: "file",
      name: file.name,
      nameLower: file.name.toLowerCase(),
      path: file.path,
      bytes: file.size,
      contentType: file.type,
      ext: file.type.split("/")[1], // Leave in the frontend to pass back
    });

    driveNodes.push(driveNode);
  }

  await Promise.all([...driveNodes.map((driveNode) => driveNode.save())]);

  return true;
}

module.exports = { createDriveNodes };
