const DriveNode = require("../models/driveNode.model");
const mongoose = require("mongoose");

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
  // for files, pass back the ext

  if (path) {
    path = path.toLowerCase() + "/";
  }

  console.log(path);

  const driveNodes = await DriveNode.aggregate([
    { $match: { ownerId: ownerId, path: path } },
    {
      $project: {
        type: 1,
        name: 1,
        path: 1,
        bytes: 1,
      },
    },
    {
      $group: {
        _id: "$type",
        data: {
          $push: {
            name: "$name",
            type: "$type",
            path: "$path",
            bytes: "$bytes",
          },
        },
      },
    },
  ]);

  const files = driveNodes.find((node) => node._id === "file")?.data || [];
  const folders = driveNodes.find((node) => node._id === "folder")?.data || [];

  console.log(files);
  console.log(folders);

  return {
    files,
    folders,
  };
}

module.exports = { createDriveNodes, retrieveDriveNodesFromPath };
