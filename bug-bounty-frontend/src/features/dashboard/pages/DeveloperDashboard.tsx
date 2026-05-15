import { Activity, CheckCircle2, FileText, Lightbulb, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { getResearcherPrograms } from "@/features/programs";
import { getResearcherReports } from "@/features/reports";
import { getResearcherFeatureRequests } from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

export default function DeveloperDashboard() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: programsData } = useQuery({
    queryKey: ["researcher-programs"],
    queryFn: () => getResearcherPrograms(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const { data: reportsData } = useQuery({
    queryKey: ["researcher-reports"],
    queryFn: () => getResearcherReports(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const { data: featureRequestsData } = useQuery({
    queryKey: ["researcher-feature-requests"],
    queryFn: () => getResearcherFeatureRequests(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const myReports = reportsData?.reports ?? [];
  const acceptedReports = myReports.filter((report) => report.status === "resolved");

  return (
    <div>
      <PageHeader
        title="Researcher Dashboard"
        description={`Welcome back, ${user?.name ?? "researcher"}. Here's a snapshot of your bug bounty activity.`}
      />

      <Card className="mb-6 border-border/70 shadow-[var(--shadow-soft)] rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold tracking-tight">Ready to hunt</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Review active programs, submit clear reports, and pick up available feature requests.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Programs" value={programsData?.programs.length ?? 0} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="My Reports" value={myReports.length} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Resolved" value={acceptedReports.length} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Feature Requests" value={featureRequestsData?.featureRequests.length ?? 0} icon={<Lightbulb className="h-4 w-4" />} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Recent activity</h3>
      </div>
      <EmptyState
        title="No new activity"
        description="Report updates and feature request activity will appear here."
      />
    </div>
  );
}
