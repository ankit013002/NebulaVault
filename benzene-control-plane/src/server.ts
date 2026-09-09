import mongoose from "mongoose";

import { createApp } from "./app.js";
import { config } from "./config/env.js";

async function main(): Promise<void> {
  const cfg = config();

  await mongoose.connect(cfg.mongooseUri);
  console.log("[file-service] connected to file metadata DB");

  const app = createApp();
  const server = app.listen(cfg.port, () => {
    console.log(
      `[file-service] listening on :${cfg.port} (storage: ${cfg.storageDriver})`
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[file-service] ${signal} received, shutting down`);
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err: unknown) => {
  console.error("[file-service] failed to start:", err);
  process.exit(1);
});
