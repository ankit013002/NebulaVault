import { sql } from "drizzle-orm";
import mongoose from "mongoose";

import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { closeDb, db } from "./db/client.js";

async function main(): Promise<void> {
  const cfg = config();

  // Fail fast on an unreachable control-plane database rather than surfacing
  // it as a 500 on the first request that touches a vault.
  await db().execute(sql`select 1`);
  console.log("[control-plane] connected to PostgreSQL");

  await mongoose.connect(cfg.mongooseUri);
  console.log("[control-plane] connected to file metadata DB");

  const app = createApp();
  const server = app.listen(cfg.port, () => {
    console.log(
      `[control-plane] listening on :${cfg.port} (storage: ${cfg.storageDriver})`
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[control-plane] ${signal} received, shutting down`);
    server.close();
    await mongoose.disconnect();
    await closeDb();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err: unknown) => {
  console.error("[control-plane] failed to start:", err);
  process.exit(1);
});
