const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    message: "Made it permission router",
  });
});

module.exports = router;
