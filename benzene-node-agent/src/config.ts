import { homedir, hostname } from "node:os";
import path from "node:path";

import dotenv from "dotenv";

dotenv.config();

export interface AgentConfig {
  /** Where the control plane lives, via the gateway. */
  controlPlaneUrl: string;
  /** Root of everything this agent owns on disk. */
  dataDir: string;
  storageDir: string;
  identityFile: string;
  /** Bytes this device offers the vault. */
  allocatedBytes: number;
  /** Port the transfer server listens on for LAN peers. */
  port: number;
  heartbeatIntervalMs: number;
  deviceName: string;
  platform: "macos" | "windows" | "linux" | "other";
}

function detectPlatform(): AgentConfig["platform"] {
  switch (process.platform) {
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    case "linux":
      return "linux";
    default:
      return "other";
  }
}

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return parsed;
}

export function loadAgentConfig(overrides: Partial<AgentConfig> = {}): AgentConfig {
  const dataDir =
    overrides.dataDir ?? process.env["BENZENE_DATA_DIR"] ?? path.join(homedir(), ".benzene");

  return {
    controlPlaneUrl: (
      overrides.controlPlaneUrl ??
      process.env["BENZENE_CONTROL_PLANE_URL"] ??
      "http://localhost:8080"
    ).replace(/\/+$/, ""),
    dataDir,
    storageDir: overrides.storageDir ?? path.join(dataDir, "storage"),
    identityFile: overrides.identityFile ?? path.join(dataDir, "identity.json"),
    // Zero means "enrolled but contributing nothing yet"; the control plane is
    // the source of truth once the user has chosen an amount.
    allocatedBytes: overrides.allocatedBytes ?? intFromEnv("BENZENE_ALLOCATED_BYTES", 0),
    port: overrides.port ?? intFromEnv("BENZENE_AGENT_PORT", 7070),
    heartbeatIntervalMs:
      overrides.heartbeatIntervalMs ?? intFromEnv("BENZENE_HEARTBEAT_MS", 30_000),
    deviceName:
      overrides.deviceName ?? process.env["BENZENE_DEVICE_NAME"] ?? defaultDeviceName(),
    platform: overrides.platform ?? detectPlatform(),
  };
}

function defaultDeviceName(): string {
  return hostname() || "Benzene Device";
}
