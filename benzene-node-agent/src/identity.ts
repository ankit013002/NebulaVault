import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateDeviceKeyPair, type DeviceKeyPair } from "./protocol.js";

/**
 * The device's long-lived identity.
 *
 * Persisted so the machine is the same device across restarts. The private key
 * is written with owner-only permissions; a production build should move it to
 * platform-secure storage (Keychain, DPAPI, Keystore) per architecture §34,
 * which is tracked separately because it is per-platform native work.
 */
export interface DeviceIdentity extends DeviceKeyPair {
  /** Assigned by the control plane once enrollment is approved. */
  deviceId: string | null;
  enrollmentId: string | null;
  createdAt: string;
}

export class IdentityStore {
  constructor(private readonly filePath: string) {}

  async load(): Promise<DeviceIdentity | null> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return JSON.parse(raw) as DeviceIdentity;
    } catch {
      return null;
    }
  }

  async save(identity: DeviceIdentity): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(identity, null, 2), "utf8");
    // Best effort: chmod is a no-op on Windows, where ACLs govern instead.
    await chmod(this.filePath, 0o600).catch(() => undefined);
  }

  /** Returns the existing identity, generating a keypair on first run. */
  async loadOrCreate(): Promise<DeviceIdentity> {
    const existing = await this.load();
    if (existing) return existing;

    const identity: DeviceIdentity = {
      ...generateDeviceKeyPair(),
      deviceId: null,
      enrollmentId: null,
      createdAt: new Date().toISOString(),
    };
    await this.save(identity);
    return identity;
  }
}
