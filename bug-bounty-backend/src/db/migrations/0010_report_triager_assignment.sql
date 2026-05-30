ALTER TABLE "reports" ADD COLUMN "assigned_triager_id" uuid;
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_assigned_triager_id_profiles_id_fk" FOREIGN KEY ("assigned_triager_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
