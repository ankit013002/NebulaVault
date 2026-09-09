import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";

import type { Express } from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ObjectStore } from "./store.js";
import { createTransferServer } from "./transferServer.js";

const TOKEN = "test-transfer-token";

let root: string;
let store: ObjectStore;
let app: Express;

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "benzene-transfer-"));
  store = new ObjectStore({ rootDir: root, allocatedBytes: 1024 });
  await store.load();
  app = createTransferServer({ store, transferToken: TOKEN });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("access control", () => {
  // A node must not expose an unrestricted file server (§81).
  it.each([
    ["GET", "/objects/" + sha256("x")],
    ["PUT", "/objects/" + sha256("x")],
    ["DELETE", "/objects/" + sha256("x")],
  ])("refuses %s %s without a transfer token", async (method, url) => {
    await request(app)[method.toLowerCase() as "get"](url).expect(401);
  });

  it("refuses a wrong token", async () => {
    await request(app)
      .get(`/objects/${sha256("x")}`)
      .set("X-Transfer-Token", "not-the-token")
      .expect(401);
  });

  it("serves health without a token, for local liveness checks", async () => {
    const res = await request(app).get("/health").expect(200);

    expect(res.body).toMatchObject({ status: "ok", service: "benzene-node-agent" });
  });
});

describe("object transfer", () => {
  it("accepts an object and serves it back byte for byte", async () => {
    const body = "peer transferred payload";
    const hash = sha256(body);

    await request(app)
      .put(`/objects/${hash}`)
      .set("X-Transfer-Token", TOKEN)
      .set("Content-Type", "application/octet-stream")
      .send(body)
      .expect(201);

    const res = await request(app)
      .get(`/objects/${hash}`)
      .set("X-Transfer-Token", TOKEN)
      .expect(200);

    expect(res.body.toString()).toBe(body);
  });

  // The hash is in the URL, so a substituted transfer is caught on arrival
  // rather than discovered on a later read.
  it("rejects bytes that do not match the hash in the URL", async () => {
    await request(app)
      .put(`/objects/${sha256("expected")}`)
      .set("X-Transfer-Token", TOKEN)
      .set("Content-Type", "application/octet-stream")
      .send("something else entirely")
      .expect(422);

    expect(await store.list()).toEqual([]);
  });

  it("refuses an object that would exceed the allocation", async () => {
    const big = "x".repeat(2048);

    await request(app)
      .put(`/objects/${sha256(big)}`)
      .set("X-Transfer-Token", TOKEN)
      .set("Content-Type", "application/octet-stream")
      .send(big)
      .expect(507);
  });

  it.each([
    ["not hex", "zzzz"],
    ["too short", "abc123"],
  ])("rejects an object path that is %s", async (_label, hash) => {
    await request(app)
      .get(`/objects/${hash}`)
      .set("X-Transfer-Token", TOKEN)
      .expect(400);
  });

  it("reports an object it does not hold", async () => {
    await request(app)
      .get(`/objects/${sha256("absent")}`)
      .set("X-Transfer-Token", TOKEN)
      .expect(404);
  });

  it("reports size and encryption mode without sending the body", async () => {
    await store.put(Readable.from([Buffer.from("metadata probe")]));
    const hash = sha256("metadata probe");

    const res = await request(app)
      .head(`/objects/${hash}`)
      .set("X-Transfer-Token", TOKEN)
      .expect(200);

    expect(res.headers["content-length"]).toBe(String("metadata probe".length));
    expect(res.headers["x-object-encryption"]).toBe("none");
  });

  it("deletes an object on request", async () => {
    await store.put(Readable.from([Buffer.from("disposable")]));
    const hash = sha256("disposable");

    await request(app)
      .delete(`/objects/${hash}`)
      .set("X-Transfer-Token", TOKEN)
      .expect(204);

    expect(await store.has(hash)).toBe(false);
  });

  it("returns 404 for an unknown route", async () => {
    await request(app).get("/nope").set("X-Transfer-Token", TOKEN).expect(404);
  });
});
