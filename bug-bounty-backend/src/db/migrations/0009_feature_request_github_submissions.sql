CREATE TYPE "public"."feature_request_submission_status" AS ENUM('submitted', 'approved', 'rejected');
--> statement-breakpoint
ALTER TABLE "feature_requests" ADD COLUMN "repository_url" text;
--> statement-breakpoint
UPDATE "feature_requests" SET "repository_url" = 'https://github.com/example/repository' WHERE "repository_url" IS NULL;
--> statement-breakpoint
ALTER TABLE "feature_requests" ALTER COLUMN "repository_url" SET NOT NULL;
--> statement-breakpoint
CREATE TABLE "feature_request_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_request_id" uuid NOT NULL,
	"researcher_id" uuid NOT NULL,
	"submission_url" text NOT NULL,
	"status" "feature_request_submission_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feature_request_submissions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "feature_request_submissions" ADD CONSTRAINT "feature_request_submissions_feature_request_id_feature_requests_id_fk" FOREIGN KEY ("feature_request_id") REFERENCES "public"."feature_requests"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "feature_request_submissions" ADD CONSTRAINT "feature_request_submissions_researcher_id_profiles_id_fk" FOREIGN KEY ("researcher_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE POLICY "feature_request_submissions_participant_select" ON "feature_request_submissions"
  FOR SELECT
  TO authenticated
  USING (
    researcher_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM feature_requests
      INNER JOIN organizations ON organizations.id = feature_requests.organization_id
      WHERE feature_requests.id = feature_request_submissions.feature_request_id
        AND organizations.owner_id = auth.uid()
    )
  );
--> statement-breakpoint
CREATE POLICY "feature_request_submissions_researcher_insert" ON "feature_request_submissions"
  FOR INSERT
  TO authenticated
  WITH CHECK (researcher_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "feature_request_submissions_owner_update" ON "feature_request_submissions"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM feature_requests
      INNER JOIN organizations ON organizations.id = feature_requests.organization_id
      WHERE feature_requests.id = feature_request_submissions.feature_request_id
        AND organizations.owner_id = auth.uid()
    )
  );
--> statement-breakpoint
ALTER TABLE "feature_request_submissions" REPLICA IDENTITY FULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'feature_request_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "feature_request_submissions";
  END IF;
END $$;
