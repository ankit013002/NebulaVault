import type { AgentConfig } from "./config.js";
import { ControlPlaneClient, ControlPlaneError } from "./controlPlane.js";
import { IdentityStore, type DeviceIdentity } from "./identity.js";
import { ObjectStore } from "./store.js";

export const AGENT_VERSION = "0.1.0";

export interface EnrollmentPrompt {
  code: string;
  expiresAt: string;
}

export interface AgentEvents {
  /** Raised with the pairing code the user must approve. */
  onEnrollmentPending?: (prompt: EnrollmentPrompt) => void;
  onEnrolled?: (deviceId: string) => void;
  onHeartbeat?: (result: { status: string; usedBytes: number }) => void;
  onError?: (error: unknown) => void;
}

/**
 * Ties the pieces together: identity, enrollment, storage and presence.
 *
 * Deliberately has no timers of its own beyond the heartbeat loop, so it can be
 * driven step by step from tests and from a UI that wants to show progress.
 */
export class Agent {
  private readonly identityStore: IdentityStore;
  private readonly client: ControlPlaneClient;
  private heartbeatTimer: NodeJS.Timeout | undefined;
  private identity: DeviceIdentity | undefined;

  constructor(
    private readonly config: AgentConfig,
    readonly store: ObjectStore,
    private readonly events: AgentEvents = {},
    client?: ControlPlaneClient
  ) {
    this.identityStore = new IdentityStore(config.identityFile);
    this.client = client ?? new ControlPlaneClient(config.controlPlaneUrl);
  }

  currentIdentity(): DeviceIdentity | undefined {
    return this.identity;
  }

  /** Loads or generates this machine's keypair. */
  async initialise(): Promise<DeviceIdentity> {
    this.identity = await this.identityStore.loadOrCreate();
    await this.store.load();
    return this.identity;
  }

  /**
   * Ensures this device is enrolled, starting the flow if not.
   *
   * Returns as soon as a pairing code exists — approval happens on another
   * screen and may take arbitrarily long, so blocking here would be wrong.
   */
  async ensureEnrolled(): Promise<{ enrolled: boolean; prompt?: EnrollmentPrompt }> {
    const identity = this.requireIdentity();
    if (identity.deviceId) return { enrolled: true };

    // Resume an enrollment already in flight rather than orphaning it, which
    // would leave a stale pending code in the user's approval list.
    if (identity.enrollmentId) {
      const resumed = await this.pollEnrollment();
      if (resumed) return { enrolled: true };
    }

    if (!this.requireIdentity().enrollmentId) {
      const ticket = await this.client.requestEnrollment({
        publicKey: identity.publicKey,
        deviceName: this.config.deviceName,
        platform: this.config.platform,
      });

      identity.enrollmentId = ticket.id;
      await this.identityStore.save(identity);

      const prompt = { code: ticket.code, expiresAt: ticket.expiresAt };
      this.events.onEnrollmentPending?.(prompt);
      return { enrolled: false, prompt };
    }

    return { enrolled: false };
  }

  /**
   * Checks whether the user has approved yet.
   *
   * Returns true once the device has an id. An expired or rejected enrollment
   * is cleared so the next attempt starts a fresh one instead of polling a
   * ticket that can never be approved.
   */
  async pollEnrollment(): Promise<boolean> {
    const identity = this.requireIdentity();
    if (identity.deviceId) return true;
    if (!identity.enrollmentId) return false;

    let status;
    try {
      status = await this.client.getEnrollmentStatus(
        identity.enrollmentId,
        identity.publicKey
      );
    } catch (err) {
      // A 404 means the control plane no longer knows this ticket; anything
      // else is transient and worth retrying with the same one.
      if (err instanceof ControlPlaneError && err.status === 404) {
        identity.enrollmentId = null;
        await this.identityStore.save(identity);
        return false;
      }
      throw err;
    }

    if (status.status === "consumed" && status.deviceId) {
      identity.deviceId = status.deviceId;
      identity.enrollmentId = null;
      await this.identityStore.save(identity);
      this.events.onEnrolled?.(status.deviceId);
      return true;
    }

    if (status.status === "expired" || status.status === "rejected") {
      identity.enrollmentId = null;
      await this.identityStore.save(identity);
    }

    return false;
  }

  /** One presence report. Returns null when the device is not yet enrolled. */
  async sendHeartbeat(): Promise<{ status: string; usedBytes: number } | null> {
    const identity = this.requireIdentity();
    if (!identity.deviceId) return null;

    const usedBytes = this.store.usedBytes();
    const result = await this.client.heartbeat({
      deviceId: identity.deviceId,
      privateKey: identity.privateKey,
      usedBytes,
      availableBytes: this.store.availableBytes(),
      appVersion: AGENT_VERSION,
    });

    const report = { status: result.status, usedBytes };
    this.events.onHeartbeat?.(report);
    return report;
  }

  /**
   * Begins reporting presence on a timer.
   *
   * Failures are surfaced but never throw out of the interval: the control
   * plane being briefly unreachable is normal and must not stop an agent that
   * is otherwise healthy and serving data on the LAN.
   */
  startHeartbeat(): void {
    if (this.heartbeatTimer) return;

    const tick = (): void => {
      void this.sendHeartbeat().catch((err: unknown) => {
        this.events.onError?.(err);
      });
    };

    tick();
    this.heartbeatTimer = setInterval(tick, this.config.heartbeatIntervalMs);
    // Do not hold the process open on this timer alone.
    this.heartbeatTimer.unref?.();
  }

  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private requireIdentity(): DeviceIdentity {
    if (!this.identity) {
      throw new Error("Agent.initialise() must be awaited before use");
    }
    return this.identity;
  }
}
