import { timingSafeEqual } from "node:crypto";

import express, { type Express } from "express";
import helmet from "helmet";

import { AllocationExceededError, IntegrityError, ObjectStore } from "./store.js";

/**
 * Serves this device's objects to peers on the local network.
 *
 * Architecture §81: a node must not expose an unrestricted file server. Access
 * is gated on a transfer token rather than being open to anything that can
 * reach the port.
 *
 * The token here is a single shared secret issued by the control plane at
 * startup — enough to keep the port from being an open door, but deliberately
 * weaker than the eventual design, which scopes a token to one object, one
 * peer and a few minutes. That upgrade belongs with remote transfers, when the
 * port stops being LAN-only; until then this is the honest limit.
 */

export interface TransferServerOptions {
  store: ObjectStore;
  /** Shared secret peers must present. */
  transferToken: string;
}

function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

const HASH_PATTERN = /^[a-f0-9]{64}$/;

export function createTransferServer(options: TransferServerOptions): Express {
  const app = express();

  app.use(helmet());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "benzene-node-agent",
      usedBytes: options.store.usedBytes(),
      availableBytes: options.store.availableBytes(),
    });
  });

  app.use((req, res, next) => {
    const provided = req.get("x-transfer-token") ?? "";
    if (!tokensMatch(provided, options.transferToken)) {
      res.status(401).json({ message: "Invalid transfer token", code: "UNAUTHORIZED" });
      return;
    }
    next();
  });

  /** Object keys are hashes; anything else is refused before touching disk. */
  app.param("hash", (req, res, next, value: string) => {
    if (!HASH_PATTERN.test(value)) {
      res.status(400).json({ message: "Not a valid object hash", code: "BAD_REQUEST" });
      return;
    }
    next();
  });

  app.head("/objects/:hash", (req, res) => {
    void (async () => {
      const hash = req.params["hash"] as string;
      const meta = await options.store.metadata(hash);
      if (!meta) {
        res.status(404).end();
        return;
      }
      res.setHeader("Content-Length", String(meta.size));
      res.setHeader("X-Object-Encryption", meta.encryption);
      res.status(200).end();
    })();
  });

  app.get("/objects/:hash", (req, res) => {
    void (async () => {
      const hash = req.params["hash"] as string;
      if (!(await options.store.has(hash))) {
        res.status(404).json({ message: "Object not held", code: "NOT_FOUND" });
        return;
      }

      res.setHeader("Content-Type", "application/octet-stream");
      options.store.read(hash).pipe(res);
    })();
  });

  app.put("/objects/:hash", (req, res) => {
    void (async () => {
      const hash = req.params["hash"] as string;
      const declared = Number(req.get("content-length"));

      try {
        const stored = await options.store.put(req, {
          // The hash is in the URL, so a corrupted or substituted transfer is
          // rejected on arrival rather than discovered on a later read.
          expectedHash: hash,
          ...(Number.isFinite(declared) ? { expectedSize: declared } : {}),
        });
        res.status(201).json({ data: stored });
      } catch (err) {
        if (err instanceof AllocationExceededError) {
          res.status(507).json({ message: err.message, code: "ALLOCATION_EXCEEDED" });
          return;
        }
        if (err instanceof IntegrityError) {
          res.status(422).json({ message: err.message, code: "INTEGRITY" });
          return;
        }
        res.status(500).json({ message: "Could not store object", code: "SERVER" });
      }
    })();
  });

  app.delete("/objects/:hash", (req, res) => {
    void (async () => {
      await options.store.delete(req.params["hash"] as string);
      res.status(204).end();
    })();
  });

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found", code: "NOT_FOUND" });
  });

  return app;
}
