import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth";

const dashboardTables = [
  "reports",
  "programs",
  "feature_requests",
  "organization_members",
  "report_messages",
  "feature_request_submissions",
];

const queryKeys = [
  ["researcher-reports"],
  ["organization-reports"],
  ["researcher-programs"],
  ["organization-programs"],
  ["researcher-feature-requests"],
  ["organization-feature-requests"],
  ["organization-triagers"],
  ["researcher-feature-request-submissions"],
  ["organization-feature-request-submissions"],
];

export function useSupabaseRealtimeInvalidation() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    supabase.realtime.setAuth(accessToken);

    const channel = supabase.channel("dashboard-db-updates");
    dashboardTables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          queryKeys.forEach((queryKey) => {
            void queryClient.invalidateQueries({ queryKey });
          });
          void queryClient.invalidateQueries({ queryKey: ["report"] });
          void queryClient.invalidateQueries({ queryKey: ["report-messages"] });
        },
      );
    });

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [accessToken, queryClient]);
}
