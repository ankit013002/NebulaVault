import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import type { Express } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { resetConfigCache } from "./config/env.js";
import DriveNodeModel from "./models/driveNode.model.js";
import FileVersionModel from "./models/fileVersion.model.js";
import { setStorageDriver } from "./storage/index.js";

const OWNER = "user-alpha";
const OTHER_OWNER = "user-beta";

let mongo: MongoMemoryServer;
let storageRoot: string;
let app: Express;

/** Presigned URLs are absolute; supertest needs a path relative to the app. */
function toAppPath(absoluteUrl: string): string {
  const url = new URL(absoluteUrl);
  return `${url.pathname}${url.search}`;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  storageRoot = await mkdtemp(path.join(tmpdir(), "nv-http-"));

  process.env["MONGOOSE_URI"] = mongo.getUri();
  process.env["STORAGE_DRIVER"] = "local";
  process.env["LOCAL_STORAGE_DIR"] = storageRoot;
  resetConfigCache();
  setStorageDriver(undefined);

  await mongoose.connect(mongo.getUri());
  await Promise.all([DriveNodeModel.init(), FileVersionModel.init()]);

  // Imported after the env is in place so the app reads the test config.
  const { createApp } = await import("./app.js");
  app = createApp();
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
  await rm(storageRoot, { recursive: true, force: true });
  setStorageDriver(undefined);
  resetConfigCache();
}, 60_000);

afterEach(async () => {
  await Promise.all([
    DriveNodeModel.deleteMany({}),
    FileVersionModel.deleteMany({}),
  ]);
});

describe("health", () => {
  it("reports which storage driver is active", async () => {
    const res = await request(app).get("/health").expect(200);

    expect(res.body).toMatchObject({ status: "ok", storage: "local" });
  });
});

describe("authentication", () => {
  it.each([
    ["GET", "/files"],
    ["POST", "/files/uploads"],
    ["GET", "/drive-nodes"],
    ["POST", "/folders"],
  ])("rejects %s %s without the gateway identity header", async (method, url) => {
    const res = await request(app)[method.toLowerCase() as "get" | "post"](url);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("rejects a blank X-User-Id rather than treating it as an owner", async () => {
    await request(app).get("/files").set("X-User-Id", "   ").expect(401);
  });
});

describe("validation", () => {
  it("rejects an upload batch with no files", async () => {
    const res = await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "", files: [] });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("BAD_REQUEST");
  });

  it.each([
    ["a slash", "a/b.txt"],
    ["a traversal", ".."],
  ])("rejects a filename containing %s", async (_label, name) => {
    await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "", files: [{ name, size: 1 }] })
      .expect(400);
  });

  it("rejects a path containing a traversal segment", async () => {
    await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "../../etc", files: [{ name: "a.txt", size: 1 }] })
      .expect(400);
  });

  it("rejects a node id that is not an ObjectId", async () => {
    await request(app)
      .get("/files/not-an-id/download")
      .set("X-User-Id", OWNER)
      .expect(400);
  });

  it("returns 404 for an unknown route", async () => {
    await request(app).get("/nope").expect(404);
  });
});

describe("end-to-end upload over HTTP", () => {
  it("carries a file from presign through storage and back out again", async () => {
    const body = "the quick brown fox";

    // 1. Reserve a version and get a presigned target.
    const presign = await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({
        path: "reports",
        files: [{ name: "fox.txt", size: body.length, contentType: "text/plain" }],
      })
      .expect(201);

    const upload = presign.body.data.uploads[0];
    expect(upload.key).toBe(
      `users/${OWNER}/nodes/${upload.nodeId}/v1`
    );

    // 2. The browser's PUT, straight at the signed URL.
    await request(app)
      .put(toAppPath(upload.upload.url))
      .set("Content-Type", "text/plain")
      .send(body)
      .expect(200);

    // 3. Confirm the bytes landed.
    const complete = await request(app)
      .post("/files/uploads/complete")
      .set("X-User-Id", OWNER)
      .send({ versionIds: [upload.versionId] })
      .expect(200);

    expect(complete.body.data.completed[0].bytes).toBe(body.length);

    // The file is now listed with real content.
    const listing = await request(app)
      .get("/files?path=reports")
      .set("X-User-Id", OWNER)
      .expect(200);

    expect(listing.body.data.files).toHaveLength(1);
    expect(listing.body.data.files[0]).toMatchObject({
      name: "fox.txt",
      bytes: body.length,
      hasContent: true,
    });

    // And it can be downloaded through the signed URL that is handed back.
    const download = await request(app)
      .get(`/files/${upload.nodeId}/download?redirect=false`)
      .set("X-User-Id", OWNER)
      .expect(200);

    const fetched = await request(app)
      .get(toAppPath(download.body.data.url))
      .expect(200);

    expect(fetched.text).toBe(body);
    expect(fetched.headers["content-disposition"]).toContain("fox.txt");
  });

  it("redirects to storage by default so bytes bypass this service", async () => {
    const presign = await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "", files: [{ name: "r.txt", size: 2 }] })
      .expect(201);

    const upload = presign.body.data.uploads[0];
    await request(app).put(toAppPath(upload.upload.url)).send("hi").expect(200);
    await request(app)
      .post("/files/uploads/complete")
      .set("X-User-Id", OWNER)
      .send({ versionIds: [upload.versionId] })
      .expect(200);

    const res = await request(app)
      .get(`/files/${upload.nodeId}/download`)
      .set("X-User-Id", OWNER)
      .expect(302);

    expect(res.headers["location"]).toContain("/local-objects/");
  });

  it("refuses a download whose upload never completed", async () => {
    const presign = await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "", files: [{ name: "pending.txt", size: 4 }] })
      .expect(201);

    await request(app)
      .get(`/files/${presign.body.data.uploads[0].nodeId}/download`)
      .set("X-User-Id", OWNER)
      .expect(404);
  });
});

describe("signed local object URLs", () => {
  it("rejects a PUT with no signature", async () => {
    await request(app).put("/local-objects/users/x/nodes/y/v1").send("data").expect(401);
  });

  it("rejects a PUT whose signature was minted for another key", async () => {
    const presign = await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "", files: [{ name: "a.txt", size: 1 }] })
      .expect(201);

    const url = new URL(presign.body.data.uploads[0].upload.url);
    // Same signature, different key.
    await request(app)
      .put(`/local-objects/users/${OWNER}/nodes/deadbeefdeadbeefdeadbeef/v1${url.search}`)
      .send("x")
      .expect(401);
  });
});

describe("tenant isolation over HTTP", () => {
  it("does not show one owner the files of another", async () => {
    await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "", files: [{ name: "secret.txt", size: 1 }] })
      .expect(201);

    const listing = await request(app)
      .get("/files")
      .set("X-User-Id", OTHER_OWNER)
      .expect(200);

    expect(listing.body.data.files).toEqual([]);
  });

  it("refuses a cross-owner download", async () => {
    const presign = await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "", files: [{ name: "secret.txt", size: 2 }] })
      .expect(201);

    const upload = presign.body.data.uploads[0];
    await request(app).put(toAppPath(upload.upload.url)).send("hi").expect(200);
    await request(app)
      .post("/files/uploads/complete")
      .set("X-User-Id", OWNER)
      .send({ versionIds: [upload.versionId] })
      .expect(200);

    await request(app)
      .get(`/files/${upload.nodeId}/download`)
      .set("X-User-Id", OTHER_OWNER)
      .expect(404);
  });

  it("refuses a cross-owner delete", async () => {
    const presign = await request(app)
      .post("/files/uploads")
      .set("X-User-Id", OWNER)
      .send({ path: "", files: [{ name: "secret.txt", size: 1 }] })
      .expect(201);

    await request(app)
      .delete(`/drive-nodes/${presign.body.data.uploads[0].nodeId}`)
      .set("X-User-Id", OTHER_OWNER)
      .expect(404);
  });
});

describe("usage", () => {
  it("reports zero for an owner with nothing stored", async () => {
    const res = await request(app)
      .get("/files/usage")
      .set("X-User-Id", OWNER)
      .expect(200);

    expect(res.body.data).toEqual({ bytes: 0, files: 0 });
  });
});
