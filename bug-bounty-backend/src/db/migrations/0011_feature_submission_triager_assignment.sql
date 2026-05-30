ALTER TABLE "feature_request_submissions" ADD COLUMN "assigned_triager_id" uuid;
--> statement-breakpoint
ALTER TABLE "feature_request_submissions" ADD CONSTRAINT "feature_request_submissions_assigned_triager_id_profiles_id_fk" FOREIGN KEY ("assigned_triager_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
