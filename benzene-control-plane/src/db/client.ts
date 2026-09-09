import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { config } from "../config/env.js";
import * as schema from "./schema.js";

let pool: Pool | undefined;
let database: NodePgDatabase<typeof schema> | undefined;

/**
 * Lazily opened so importing a module never requires a reachable database —
 * unit tests that touch no tables still run without one.
 */
export function db(): NodePgDatabase<typeof schema> {
  if (!database) {
    pool = new Pool({ connectionString: config().databaseUrl, max: 10 });
    database = drizzle(pool, { schema });
  }
  return database;
}

export async function closeDb(): Promise<void> {
  await pool?.end();
  pool = undefined;
  database = undefined;
}

/** Test seam: point the module at an already-open pool. */
export function setDb(next: NodePgDatabase<typeof schema> | undefined): void {
  database = next;
}

export { schema };
