const express = require("express");
const router = express.Router();
const {
  getFilesFoldersInGivenPath,
} = require("../controllers/files.controller");

router.get("/", getFilesFoldersInGivenPath);

module.exports = router;
