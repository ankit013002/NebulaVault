const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://localhost/FileMetaDataDB");
const db = mongoose.connection;
db.on("error", (err) => console.error(`Error connecting to mongo: ${err}`));
db.once("open", () => console.log("Successfully connected to MongoDB"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello File Service Client",
  });
});

module.exports = app;
