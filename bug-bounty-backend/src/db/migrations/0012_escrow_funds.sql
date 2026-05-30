CREATE TYPE "public"."escrow_source_type" AS ENUM('program', 'feature_request');
--> statement-breakpoint
CREATE TYPE "public"."escrow_status" AS ENUM('held', 'released');
--> statement-breakpoint
CREATE TABLE "escrow_funds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"source_type" "escrow_source_type" NOT NULL,
	"source_id" uuid NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"status" "escrow_status" DEFAULT 'held' NOT NULL,
	"recipient_id" uuid,
	"release_reason" text,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "escrow_funds" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "escrow_funds" ADD CONSTRAINT "escrow_funds_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "escrow_funds" ADD CONSTRAINT "escrow_funds_recipient_id_profiles_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
