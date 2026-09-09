/**
 * Cross-package smoke test: the real node agent against the real control plane.
 *
 * The two are separate deployables with their own copies of the request-signing
 * format. Their unit suites and the shared protocol vectors each prove one half;
 * this proves the whole loop actually works over HTTP — enrollment, approval,
 * signature-authenticated heartbeat, and usage propagating back to the vault.
 *
 * Run from the repo root, with both packages built:
 *   node scripts/smoke-agent.mjs
 *
 * Requires a reachable PostgreSQL. Set SMOKE_DATABASE_URL to override.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import path from "node:path";

const controlPlaneRequire = createRequire(
  new URL("../benzene-control-plane/package.json", import.meta.url)
);
const agentRequire = createRequire(
  new URL("../benzene-node-agent/package.json", import.meta.url)
);

const OWNER = "auth|smoke-user";
const ALLOCATED = 64 * 1024 * 1024;

let failures = 0;
function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ok    ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  const baseUrl =
    process.env.SMOKE_DATABASE_URL ?? "postgres://postgres@127.0.0.1:55432/postgres";

  // --- throwaway Postgres database -----------------------------------------
  const { Client } = controlPlaneRequire("pg");
  const dbName = `benzene_smoke_${Date.now()}`;
  const admin = new Client({ connectionString: baseUrl });
  await admin.connect();
  await admin.query(`create database "${dbName}"`);
  await admin.end();

  const dbUrl = new URL(baseUrl);
  dbUrl.pathname = `/${dbName}`;
  const databaseUrl = dbUrl.toString();

  // --- in-memory Mongo, still holding file metadata ------------------------
  const { MongoMemoryServer } = controlPlaneRequire("mongodb-memory-server");
  const mongo = await MongoMemoryServer.create();

  const storageRoot = await mkdtemp(path.join(tmpdir(), "benzene-smoke-"));
  let server;

  try {
    process.env.DATABASE_URL = databaseUrl;
    process.env.MONGOOSE_URI = mongo.getUri();
    process.env.STORAGE_DRIVER = "local";
    process.env.LOCAL_STORAGE_DIR = path.join(storageRoot, "cp");

    // --- migrate ------------------------------------------------------------
    const { drizzle } = controlPlaneRequire("drizzle-orm/node-postgres");
    const { migrate } = controlPlaneRequire("drizzle-orm/node-postgres/migrator");
    const { Pool } = controlPlaneRequire("pg");
    const pool = new Pool({ connectionString: databaseUrl });
    const db = drizzle(pool);
    await migrate(db, {
      migrationsFolder: fileURLToPath(
        new URL("../benzene-control-plane/drizzle", import.meta.url)
      ),
    });
    await pool.end();

    // --- start the real control plane ---------------------------------------
    const { createApp } = controlPlaneRequire("./built/app.js");
    const app = createApp();
    server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    const controlPlaneUrl = `http://127.0.0.1:${port}`;
    console.log(`\ncontrol plane listening on ${controlPlaneUrl}\n`);

    // --- start the real agent -----------------------------------------------
    const { Agent } = agentRequire("./built/agent.js");
    const { loadAgentConfig } = agentRequire("./built/config.js");
    const { ObjectStore } = agentRequire("./built/store.js");

    const config = loadAgentConfig({
      controlPlaneUrl,
      dataDir: path.join(storageRoot, "agent"),
      storageDir: path.join(storageRoot, "agent", "storage"),
      identityFile: path.join(storageRoot, "agent", "identity.json"),
      allocatedBytes: ALLOCATED,
      deviceName: "Smoke Test Desktop",
      platform: "linux",
    });

    const store = new ObjectStore({
      rootDir: config.storageDir,
      allocatedBytes: config.allocatedBytes,
    });
    const agent = new Agent(config, store);
    await agent.initialise();

    console.log("enrollment");
    const { enrolled, prompt } = await agent.ensureEnrolled();
    check("agent is not enrolled before approval", enrolled === false);
    check("agent received a pairing code", /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(prompt?.code ?? ""));

    check(
      "polling before approval leaves the device unenrolled",
      (await agent.pollEnrollment()) === false
    );

    // The user approving from the web app.
    const approve = await fetch(`${controlPlaneUrl}/devices/enrollments/approve`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-User-Id": OWNER },
      body: JSON.stringify({ code: prompt.code, allocatedBytes: ALLOCATED }),
    });
    check("control plane accepted the approval", approve.status === 201, `status ${approve.status}`);

    check("agent picks up its device id", (await agent.pollEnrollment()) === true);
    check("device id is persisted", Boolean(agent.currentIdentity()?.deviceId));

    console.log("\nsignature-authenticated heartbeat");
    const beat = await agent.sendHeartbeat();
    check("heartbeat accepted and device is online", beat?.status === "online", JSON.stringify(beat));

    const devicesRes = await fetch(`${controlPlaneUrl}/devices`, {
      headers: { "X-User-Id": OWNER },
    });
    const devices = (await devicesRes.json()).data;
    check("device appears in the vault", devices.length === 1);
    check("device reports online", devices[0]?.status === "online", devices[0]?.status);
    check(
      "allocation matches what the user granted",
      devices[0]?.allocatedBytes === ALLOCATED,
      String(devices[0]?.allocatedBytes)
    );

    console.log("\nstored bytes propagate to the vault");
    const payload = Buffer.from("smoke test payload");
    const stored = await store.put(Readable.from([payload]));
    await agent.sendHeartbeat();

    const vaultRes = await fetch(`${controlPlaneUrl}/vaults/me`, {
      headers: { "X-User-Id": OWNER },
    });
    const vault = (await vaultRes.json()).data;
    check("vault reports the raw capacity the device contributed", vault.rawCapacityBytes === ALLOCATED);
    check("vault counts the device as online capacity", vault.onlineCapacityBytes === ALLOCATED);
    check("vault sees the stored bytes", vault.usedBytes === payload.length, String(vault.usedBytes));
    check("object verifies against its hash", (await store.verify(stored.hash)) === true);

    console.log("\nrejects a forged signature");
    const forged = await fetch(`${controlPlaneUrl}/agent/heartbeat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Device-Id": agent.currentIdentity().deviceId,
        "X-Device-Timestamp": String(Math.floor(Date.now() / 1000)),
        "X-Device-Signature": Buffer.from("not a real signature").toString("base64"),
      },
      body: JSON.stringify({ usedBytes: 0 }),
    });
    check("forged heartbeat is refused", forged.status === 401, `status ${forged.status}`);

    agent.stopHeartbeat();
  } finally {
    if (server) await new Promise((r) => server.close(r));
    const mongooseModule = controlPlaneRequire("mongoose");
    await mongooseModule.disconnect().catch(() => {});
    await controlPlaneRequire("./built/db/client.js").closeDb().catch(() => {});
    await mongo.stop();
    await rm(storageRoot, { recursive: true, force: true });

    const cleanup = new Client({ connectionString: baseUrl });
    await cleanup.connect();
    await cleanup.query(`drop database if exists "${dbName}" with (force)`);
    await cleanup.end();
  }

  console.log(failures === 0 ? "\nSMOKE PASSED\n" : `\nSMOKE FAILED (${failures})\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nsmoke test crashed:", err);
  process.exit(1);
});
