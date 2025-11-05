const DriveNode = require("../models/driveNode.model");

async function createDriveNodes(ownerId, nodes) {
  console.log(ownerId);
  console.log(nodes);

  // Need to handle empty folders
  const { files, emptyFolders, folders } = nodes;

  const driveNodes = [];

  // TODO: What if file already exists?
  for (const file of files) {
    const driveNode = new DriveNode({
      ownerId: ownerId,
      type: "file",
      name: file.name,
      nameLower: file.name.toLowerCase(),
      path: file.path.toLowerCase(),
      bytes: file.size,
      contentType: file.type,
      ext: file.type.split("/")[1], // Leave in the frontend to pass back
    });

    driveNodes.push(driveNode);
  }

  for (const folder of folders) {
    const driveNode = new DriveNode({
      ownerId: ownerId,
      type: "folder",
      name: folder.name,
      nameLower: folder.name.toLowerCase(),
      path: folder.path.toLowerCase(),
    });
    console.log(driveNode);

    driveNodes.push(driveNode);
  }

  console.log(driveNodes.length);

  await Promise.all([...driveNodes.map((driveNode) => driveNode.save())]);

  return true;
}

async function retrieveDriveNodesFromPath(ownerId, path) {
  const driveNodes = await DriveNode.find({ ownerId: ownerId, path: path });
  return driveNodes;
}

module.exports = { createDriveNodes, retrieveDriveNodesFromPath };
