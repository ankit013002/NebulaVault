import cors from "cors";
import express from "express";
import helmet from "helmet";

import { config } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import driveNodeRouter from "./routes/driveNode.routes.js";
import filesRouter from "./routes/files.routes.js";
import foldersRouter from "./routes/folders.routes.js";
import localObjectsRouter, { localObjectsEnabled } from "./routes/localObjects.routes.js";
import permissionsRouter from "./routes/permissions.routes.js";

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors());

  // The local-object router needs the raw body, so it is mounted ahead of the
  // JSON parser rather than after it.
  if (localObjectsEnabled()) {
    app.use("/local-objects", localObjectsRouter);
  }

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "file-service",
      storage: config().storageDriver,
    });
  });

  app.use("/drive-nodes", driveNodeRouter);
  app.use("/files", filesRouter);
  app.use("/folders", foldersRouter);
  app.use("/permissions", permissionsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
