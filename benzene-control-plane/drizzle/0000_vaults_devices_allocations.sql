CREATE TABLE "device_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"public_key" text NOT NULL,
	"device_name" text NOT NULL,
	"platform" text DEFAULT 'other' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"vault_id" uuid,
	"device_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_storage_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"label" text DEFAULT 'primary' NOT NULL,
	"allocated_bytes" bigint DEFAULT 0 NOT NULL,
	"used_bytes" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vault_id" uuid NOT NULL,
	"name" text NOT NULL,
	"platform" text DEFAULT 'other' NOT NULL,
	"public_key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"app_version" text,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vaults" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text DEFAULT 'My Vault' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "device_enrollments" ADD CONSTRAINT "device_enrollments_vault_id_vaults_id_fk" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_enrollments" ADD CONSTRAINT "device_enrollments_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_storage_allocations" ADD CONSTRAINT "device_storage_allocations_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_vault_id_vaults_id_fk" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_code_idx" ON "device_enrollments" USING btree ("code");--> statement-breakpoint
CREATE INDEX "enrollments_status_idx" ON "device_enrollments" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "allocations_device_label_idx" ON "device_storage_allocations" USING btree ("device_id","label");--> statement-breakpoint
CREATE UNIQUE INDEX "devices_public_key_idx" ON "devices" USING btree ("public_key");--> statement-breakpoint
CREATE INDEX "devices_vault_idx" ON "devices" USING btree ("vault_id");--> statement-breakpoint
CREATE INDEX "devices_status_idx" ON "devices" USING btree ("vault_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "vaults_owner_idx" ON "vaults" USING btree ("owner_id");