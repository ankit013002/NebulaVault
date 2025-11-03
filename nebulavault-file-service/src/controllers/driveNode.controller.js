const { createDriveNodes } = require("../services/driveNodes.services");
const {
  handleUsualMongooseErrors,
} = require("../utils/handleUsualMongooseError");

async function addDriveNodes(req, res) {
  const { ownerId, nodes } = req.body;
  console.log("HERE");
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

module.exports = { addDriveNodes };
