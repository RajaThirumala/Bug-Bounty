import { Activity, CheckCircle2, FileText, Lightbulb, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { mockPrograms } from "@/features/programs";
import { mockReports } from "@/features/reports";
import { mockFeatureRequests } from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

export default function DeveloperDashboard() {
  const user = useAuthStore((state) => state.user);
  const myReports = mockReports.filter((report) => report.developerId === user?.id);
  const acceptedReports = myReports.filter((report) => report.status === "resolved");

  return (
    <div>
      <PageHeader
        title="Developer Dashboard"
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
        <StatCard label="Programs" value={mockPrograms.length} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="My Reports" value={myReports.length} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Resolved" value={acceptedReports.length} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Feature Requests" value={mockFeatureRequests.length} icon={<Lightbulb className="h-4 w-4" />} />
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
