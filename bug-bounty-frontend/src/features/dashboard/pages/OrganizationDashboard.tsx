import { ClipboardList, FileText, Lightbulb, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizationPrograms } from "@/features/programs";
import { getOrganizationReports } from "@/features/reports";
import { getOrganizationFeatureRequests } from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

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
