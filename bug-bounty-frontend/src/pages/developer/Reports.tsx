import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getResearcherReports } from "@/features/reports";
import { useAuthStore } from "@/features/auth";

export default function Reports() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isLoading, error } = useQuery({
    queryKey: ["researcher-reports"],
    queryFn: () => getResearcherReports(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const reports = data?.reports ?? [];

  return (
    <div>
      <PageHeader
        title="Your reports"
        description="Track the status of every report you've submitted."
      />
      {isLoading && <p className="text-sm text-muted-foreground">Loading reports...</p>}
      {error && <p className="text-sm text-destructive">Unable to load reports.</p>}
      {!isLoading && !error && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
              <Card key={report.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/researcher/reports/${report.id}`}
                        className="font-semibold tracking-tight hover:underline"
                      >
                        {report.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">{report.programName ?? report.programId}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{report.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 capitalize">
                    {report.severity} severity
                  </p>
                </CardContent>
              </Card>
          ))}
        </div>
      ) : !isLoading && !error ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="No reports yet"
          description="When you submit a vulnerability report, it'll show up here."
          action={
            <Button asChild>
              <Link to="/researcher/submit-report">Submit your first report</Link>
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
