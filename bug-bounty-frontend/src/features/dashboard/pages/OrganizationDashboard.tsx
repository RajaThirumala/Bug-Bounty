import { ClipboardList, FileText, Lightbulb, MessageSquare, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizationPrograms } from "@/features/programs";
import { getOrganizationReports } from "@/features/reports";
import { getOrganizationFeatureRequests } from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";
import { reportStatusBadgeClass } from "@/lib/badges";

export default function OrganizationDashboard() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data } = useQuery({
    queryKey: ["organization-programs"],
    queryFn: () => getOrganizationPrograms(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const { data: reportsData } = useQuery({
    queryKey: ["organization-reports"],
    queryFn: () => getOrganizationReports(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const { data: featureRequestsData } = useQuery({
    queryKey: ["organization-feature-requests"],
    queryFn: () => getOrganizationFeatureRequests(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const myPrograms = data?.programs ?? [];
  const organizationName = data?.organization.name ?? user?.title ?? "your organization";
  const submittedReports = reportsData?.reports ?? [];
  const requests = featureRequestsData?.featureRequests ?? [];

  return (
    <div>
      <PageHeader
        title="Organization Dashboard"
        description={`Manage programs, reports, and feature requests for ${organizationName}.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Programs" value={myPrograms.length} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Submitted Reports" value={submittedReports.length} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Open Requests" value={requests.filter((request) => request.status === "open").length} icon={<Lightbulb className="h-4 w-4" />} />
        <StatCard label="Resolved Reports" value={submittedReports.filter((report) => report.status === "resolved").length} icon={<FileText className="h-4 w-4" />} />
      </div>

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-medium">Recent reports</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Open a report to review details and chat with the researcher or triager.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/organization/reports">View all</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {submittedReports.slice(0, 5).map((report) => (
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
                  <Link to={`/organization/reports/${report.id}`}>
                    <MessageSquare className="h-4 w-4" />
                    Open chat
                  </Link>
                </Button>
              </div>
            ))}
            {submittedReports.length === 0 && (
              <p className="text-sm text-muted-foreground">No submitted reports yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
