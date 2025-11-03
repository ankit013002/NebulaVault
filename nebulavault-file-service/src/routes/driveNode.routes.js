const express = require("express");
const { addDriveNodes } = require("../controllers/driveNode.controller");
const router = express.Router();

router.post("/", addDriveNodes);

module.exports = router;
