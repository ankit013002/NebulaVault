const express = require("express");
const helmet = require("helmet");
const FilesRouter = require("./routes/files.routes");
const driveNodeRouter = require("./routes/driveNode.routes");
const FoldersRouter = require("./routes/folders.routes");
const PermissionsRouter = require("./routes/permissions.routes");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello File Service Client",
  });
});

app.use("/drive-nodes", driveNodeRouter);
app.use("/files", FilesRouter);
app.use("/folders", FoldersRouter);
app.use("/permissions", PermissionsRouter);

module.exports = app;
