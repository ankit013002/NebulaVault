const express = require("express");
const {
  addDriveNodes,
  getDriveNodes,
} = require("../controllers/driveNode.controller");
const router = express.Router();

router.post("/", addDriveNodes);

router.get("/", getDriveNodes);

module.exports = router;
