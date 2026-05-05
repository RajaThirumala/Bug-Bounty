import { ClipboardList, FileText, Lightbulb, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { mockPrograms } from "@/features/programs";
import { mockReports } from "@/features/reports";
import { mockFeatureRequests } from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

export default function OrganizationDashboard() {
  const user = useAuthStore((state) => state.user);
  const organizationId = "org-acme";
  const myPrograms = mockPrograms.filter((program) => program.organizationId === organizationId);
  const myProgramIds = myPrograms.map((program) => program.id);
  const submittedReports = mockReports.filter((report) => myProgramIds.includes(report.programId));
  const requests = mockFeatureRequests.filter((request) => request.organizationId === organizationId);

  return (
    <div>
      <PageHeader
        title="Organization Dashboard"
        description={`Manage programs, reports, and feature requests for ${user.title}.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Programs" value={myPrograms.length} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Submitted Reports" value={submittedReports.length} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Open Requests" value={requests.filter((request) => request.status === "open").length} icon={<Lightbulb className="h-4 w-4" />} />
        <StatCard label="Resolved Reports" value={submittedReports.filter((report) => report.status === "resolved").length} icon={<FileText className="h-4 w-4" />} />
      </div>

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-sm font-medium">Operations snapshot</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Review new reports first, keep program scopes current, and publish feature requests when
            product work is ready for developer contributions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
