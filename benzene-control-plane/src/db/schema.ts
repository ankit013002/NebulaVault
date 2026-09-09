import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Control-plane schema.
 *
 * Relational rather than document-oriented on purpose: the entity graph
 * (vault -> device -> allocation, and later file -> version -> manifest ->
 * chunk -> replica) is highly connected, and protection state must never be
 * left partially updated. Foreign keys and transactions carry that weight
 * instead of application code.
 */

/** A device's lifecycle. Offline is not the same as lost — see §41/§42. */
export const DEVICE_STATUSES = [
  "pending",
  "online",
  "offline",
  "extended_offline",
  "suspected_lost",
  "draining",
  "removed",
] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export const ENROLLMENT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "expired",
  "consumed",
] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const PLATFORMS = ["macos", "windows", "linux", "other"] as const;
export type Platform = (typeof PLATFORMS)[number];

/**
 * The logical storage namespace. Files belong to a vault, never directly to a
 * user, so household/family vaults later need no reshaping of the file tables.
 */
export const vaults = pgTable(
  "vaults",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Auth subject of the owner, as injected by the gateway. */
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull().default("My Vault"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    // One vault per owner for now; family vaults will relax this into a
    // membership table rather than by adding a second vault per owner.
    uniqueIndex("vaults_owner_idx").on(table.ownerId),
  ]
);

/**
 * A computer contributing storage to a vault.
 *
 * `publicKey` is the device's own Ed25519 identity, generated on the device
 * during enrollment. The private half never leaves it, so the control plane
 * can authenticate a device without ever being able to impersonate one.
 */
export const devices = pgTable(
  "devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vaultId: uuid("vault_id")
      .notNull()
      .references(() => vaults.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    platform: text("platform").notNull().default("other"),
    /** Base64 SPKI-encoded Ed25519 public key. */
    publicKey: text("public_key").notNull(),
    status: text("status").notNull().default("pending"),
    appVersion: text("app_version"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    // A key identifies exactly one device, globally. Without this, a stolen
    // public key could be registered against a second vault.
    uniqueIndex("devices_public_key_idx").on(table.publicKey),
    index("devices_vault_idx").on(table.vaultId),
    index("devices_status_idx").on(table.vaultId, table.status),
  ]
);

/**
 * How much disk a device contributes.
 *
 * Kept in its own table rather than as columns on `devices` because a single
 * machine may later contribute several pools (internal SSD plus an external
 * drive, §16/§121), each its own failure domain.
 */
export const deviceStorageAllocations = pgTable(
  "device_storage_allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deviceId: uuid("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    /** Distinguishes pools on one machine; "primary" until external drives land. */
    label: text("label").notNull().default("primary"),
    allocatedBytes: bigint("allocated_bytes", { mode: "number" })
      .notNull()
      .default(0),
    /** Reported by the node agent; the control plane does not compute it. */
    usedBytes: bigint("used_bytes", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    uniqueIndex("allocations_device_label_idx").on(table.deviceId, table.label),
  ]
);

/**
 * A pending request from a new device to join a vault.
 *
 * The device starts this itself and cannot complete it: an authenticated user
 * must approve the code out of band. That keeps possession of a keypair from
 * being sufficient to join someone's vault.
 */
export const deviceEnrollments = pgTable(
  "device_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Short human-readable pairing code the user types or scans. */
    code: text("code").notNull(),
    publicKey: text("public_key").notNull(),
    deviceName: text("device_name").notNull(),
    platform: text("platform").notNull().default("other"),
    status: text("status").notNull().default("pending"),
    /** Set only once a user approves; null while pending. */
    vaultId: uuid("vault_id").references(() => vaults.id, {
      onDelete: "cascade",
    }),
    deviceId: uuid("device_id").references(() => devices.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    uniqueIndex("enrollments_code_idx").on(table.code),
    index("enrollments_status_idx").on(table.status, table.expiresAt),
  ]
);

export type Vault = typeof vaults.$inferSelect;
export type NewVault = typeof vaults.$inferInsert;
export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;
export type DeviceStorageAllocation = typeof deviceStorageAllocations.$inferSelect;
export type DeviceEnrollment = typeof deviceEnrollments.$inferSelect;
