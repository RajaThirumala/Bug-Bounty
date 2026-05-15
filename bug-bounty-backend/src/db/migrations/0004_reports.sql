CREATE TYPE "public"."report_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('submitted', 'triaged', 'resolved', 'rejected');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"researcher_id" uuid NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"severity" "report_severity" NOT NULL,
	"status" "report_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_researcher_id_profiles_id_fk" FOREIGN KEY ("researcher_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
