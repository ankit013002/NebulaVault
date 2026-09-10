CREATE TABLE "replicas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vault_id" uuid NOT NULL,
	"object_hash" text NOT NULL,
	"device_id" uuid NOT NULL,
	"size_bytes" bigint DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'placing' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vault_id" uuid NOT NULL,
	"mode" text DEFAULT 'protected' NOT NULL,
	"cloud_protection" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "replicas" ADD CONSTRAINT "replicas_vault_id_vaults_id_fk" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replicas" ADD CONSTRAINT "replicas_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_policies" ADD CONSTRAINT "storage_policies_vault_id_vaults_id_fk" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "replicas_object_device_idx" ON "replicas" USING btree ("vault_id","object_hash","device_id");--> statement-breakpoint
CREATE INDEX "replicas_object_idx" ON "replicas" USING btree ("vault_id","object_hash");--> statement-breakpoint
CREATE INDEX "replicas_device_idx" ON "replicas" USING btree ("device_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "storage_policies_vault_idx" ON "storage_policies" USING btree ("vault_id");