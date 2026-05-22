CREATE TABLE "report_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_messages" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "report_messages" ADD CONSTRAINT "report_messages_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_messages" ADD CONSTRAINT "report_messages_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE POLICY "reports_participant_select" ON "reports"
  FOR SELECT
  TO authenticated
  USING (
    researcher_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM programs
      INNER JOIN organization_members
        ON organization_members.organization_id = programs.organization_id
      WHERE programs.id = reports.program_id
        AND organization_members.profile_id = auth.uid()
        AND organization_members.role IN ('owner', 'triager')
    )
  );
--> statement-breakpoint
CREATE POLICY "programs_authenticated_select" ON "programs"
  FOR SELECT
  TO authenticated
  USING (
    status IN ('active', 'private')
    OR EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = programs.organization_id
        AND organization_members.profile_id = auth.uid()
        AND organization_members.role IN ('owner', 'triager')
    )
  );
--> statement-breakpoint
CREATE POLICY "feature_requests_authenticated_select" ON "feature_requests"
  FOR SELECT
  TO authenticated
  USING (true);
--> statement-breakpoint
CREATE POLICY "organization_members_member_select" ON "organization_members"
  FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM organizations
      WHERE organizations.id = organization_members.organization_id
        AND organizations.owner_id = auth.uid()
    )
  );
--> statement-breakpoint
CREATE POLICY "report_messages_participant_select" ON "report_messages"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM reports
      WHERE reports.id = report_messages.report_id
        AND (
          reports.researcher_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM programs
            INNER JOIN organization_members
              ON organization_members.organization_id = programs.organization_id
            WHERE programs.id = reports.program_id
              AND organization_members.profile_id = auth.uid()
              AND organization_members.role IN ('owner', 'triager')
          )
        )
    )
  );
--> statement-breakpoint
ALTER TABLE "reports" REPLICA IDENTITY FULL;
--> statement-breakpoint
ALTER TABLE "programs" REPLICA IDENTITY FULL;
--> statement-breakpoint
ALTER TABLE "feature_requests" REPLICA IDENTITY FULL;
--> statement-breakpoint
ALTER TABLE "organization_members" REPLICA IDENTITY FULL;
--> statement-breakpoint
ALTER TABLE "report_messages" REPLICA IDENTITY FULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "reports";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'programs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "programs";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'feature_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "feature_requests";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'organization_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "organization_members";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'report_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "report_messages";
  END IF;
END $$;
