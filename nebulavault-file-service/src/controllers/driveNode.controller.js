const {
  createDriveNodes,
  retrieveDriveNodesFromPath,
} = require("../services/driveNodes.services");
const {
  handleUsualMongooseErrors,
} = require("../utils/handleUsualMongooseError");

async function addDriveNodes(req, res) {
  const ownerId = req.get("x-user-id");
  const nodes = req.body;
  try {
    const driveNodes = await createDriveNodes(ownerId, nodes);

    res.status(201).json({
      message: "Successfully added the nodes",
      data: driveNodes,
    });
  } catch (err) {
    return handleUsualMongooseErrors(err, res);
  }
}

async function getDriveNodes(req, res) {
  const ownerId = req.get("x-user-id");
  const path = req.query.path;

  try {
    const drivesNodes = await retrieveDriveNodesFromPath(ownerId, path);

    return res.status(200).json({
      message: "Successfully retrieved drive nodes",
      data: {
        files: drivesNodes.files,
        folders: drivesNodes.folders,
      },
    });
  } catch (err) {
    return handleUsualMongooseErrors(err, res);
  }
}

module.exports = { addDriveNodes, getDriveNodes };
