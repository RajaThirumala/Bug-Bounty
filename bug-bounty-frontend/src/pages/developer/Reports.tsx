import { FileText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockPrograms } from "@/features/programs";
import { mockReports } from "@/features/reports";
import { useAuthStore } from "@/features/auth";

export default function Reports() {
  const user = useAuthStore((state) => state.user);
  const reports = mockReports.filter((report) => report.developerId === user?.id);

  return (
    <div>
      <PageHeader
        title="Your reports"
        description="Track the status of every report you've submitted."
      />
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => {
            const program = mockPrograms.find((item) => item.id === report.programId);
            return (
              <Card key={report.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold tracking-tight">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{program?.name ?? report.programId}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{report.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 capitalize">
                    {report.severity} severity
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="No reports yet"
          description="When you submit a vulnerability report, it'll show up here."
          action={
            <Button asChild>
              <Link to="/developer/submit-report">Submit your first report</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
