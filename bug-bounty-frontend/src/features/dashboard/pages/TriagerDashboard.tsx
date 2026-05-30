import { ClipboardList, FileText, MessageSquare, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrganizationReports } from "@/features/reports";
import { useAuthStore } from "@/features/auth";
import { reportStatusBadgeClass } from "@/lib/badges";

export default function TriagerDashboard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const { data } = useQuery({
    queryKey: ["organization-reports"],
    queryFn: () => getOrganizationReports(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const reports = data?.reports ?? [];
  const assignedReports = reports.filter((report) => report.assignedTriagerId === userId);

  return (
    <div>
      <PageHeader
        title="Triager Dashboard"
        description="Review submitted reports, verify severity, and move reports through triage."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Assigned to me" value={assignedReports.length} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Triaged" value={reports.filter((report) => report.status === "triaged").length} icon={<ShieldAlert className="h-4 w-4" />} />
        <StatCard label="Resolved" value={reports.filter((report) => report.status === "resolved").length} icon={<FileText className="h-4 w-4" />} />
      </div>

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-medium">Review queue</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Open a report to review details and chat with the researcher.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/triager/reports">View all</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {(assignedReports.length > 0 ? assignedReports : reports).slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{report.title}</p>
                    <Badge variant="outline" className={reportStatusBadgeClass(report.status, "capitalize")}>{report.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {report.programName ?? report.programId}
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link to={`/triager/reports/${report.id}`}>
                    <MessageSquare className="h-4 w-4" />
                    Open chat
                  </Link>
                </Button>
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-sm text-muted-foreground">No reports are waiting for review.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
