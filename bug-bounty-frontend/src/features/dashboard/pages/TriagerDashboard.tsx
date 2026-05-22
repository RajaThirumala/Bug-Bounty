import { ClipboardList, FileText, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizationReports } from "@/features/reports";
import { useAuthStore } from "@/features/auth";

export default function TriagerDashboard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data } = useQuery({
    queryKey: ["organization-reports"],
    queryFn: () => getOrganizationReports(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const reports = data?.reports ?? [];

  return (
    <div>
      <PageHeader
        title="Triager Dashboard"
        description="Review submitted reports, verify severity, and move reports through triage."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Submitted" value={reports.filter((report) => report.status === "submitted").length} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Triaged" value={reports.filter((report) => report.status === "triaged").length} icon={<ShieldAlert className="h-4 w-4" />} />
        <StatCard label="Resolved" value={reports.filter((report) => report.status === "resolved").length} icon={<FileText className="h-4 w-4" />} />
      </div>

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-sm font-medium">Review queue</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Use the reports page to confirm severity and update the triage status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
