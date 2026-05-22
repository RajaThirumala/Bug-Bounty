import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getOrganizationReports,
  updateReportStatus,
  type ReportSeverity,
  type ReportStatus,
} from "@/features/reports";
import { useAuthStore } from "@/features/auth";

const statusLabels: Record<ReportStatus, string> = {
  submitted: "Submitted",
  triaged: "Triaged",
  resolved: "Resolved",
  rejected: "Rejected",
};

const severityLabels: Record<ReportSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export default function OrganizationReports() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.user?.role);
  const queryClient = useQueryClient();
  const [draftStatuses, setDraftStatuses] = useState<Record<string, ReportStatus>>({});
  const [draftSeverities, setDraftSeverities] = useState<Record<string, ReportSeverity>>({});
  const { data, isLoading, error } = useQuery({
    queryKey: ["organization-reports"],
    queryFn: () => getOrganizationReports(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const mutation = useMutation({
    mutationFn: ({
      reportId,
      status,
      severity,
    }: {
      reportId: string;
      status: ReportStatus;
      severity: ReportSeverity;
    }) => updateReportStatus(accessToken ?? "", reportId, status, severity),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization-reports"] });
    },
  });
  const reports = useMemo(() => data?.reports ?? [], [data?.reports]);
  const detailBasePath = role === "triager" ? "/triager/reports" : "/organization/reports";

  useEffect(() => {
    setDraftStatuses(
      Object.fromEntries(reports.map((report) => [report.id, report.status])),
    );
    setDraftSeverities(
      Object.fromEntries(reports.map((report) => [report.id, report.severity])),
    );
  }, [reports]);

  return (
    <div>
      <PageHeader
        title="Submitted Reports"
        description="Review incoming vulnerability reports and update their status."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading reports...</p>}
      {error && <p className="text-sm text-destructive">Unable to load reports.</p>}
      {!isLoading && !error && reports.length === 0 && (
        <EmptyState
          title="No submitted reports"
          description="Reports submitted to your programs will appear here."
        />
      )}

      {reports.length > 0 && (
      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <Link to={`${detailBasePath}/${report.id}`} className="hover:underline">
                        {report.title}
                      </Link>
                    </TableCell>
                    <TableCell>{report.programName ?? report.programId}</TableCell>
                    <TableCell className="w-40">
                      <Select
                        value={draftSeverities[report.id] ?? report.severity}
                        onValueChange={(severity) =>
                          setDraftSeverities((current) => ({
                            ...current,
                            [report.id]: severity as ReportSeverity,
                          }))
                        }
                      >
                        <SelectTrigger aria-label="Report severity">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(severityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="w-44">
                      <Select
                        value={draftStatuses[report.id] ?? report.status}
                        onValueChange={(status) =>
                          setDraftStatuses((current) => ({
                            ...current,
                            [report.id]: status as ReportStatus,
                          }))
                        }
                      >
                        <SelectTrigger aria-label="Report status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`${detailBasePath}/${report.id}`}>
                            <MessageSquare className="h-4 w-4" />
                            Chat
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          disabled={
                            mutation.isPending ||
                            ((draftStatuses[report.id] ?? report.status) === report.status &&
                              (draftSeverities[report.id] ?? report.severity) === report.severity)
                          }
                          onClick={() =>
                            mutation.mutate({
                              reportId: report.id,
                              status: draftStatuses[report.id] ?? report.status,
                              severity: draftSeverities[report.id] ?? report.severity,
                            })
                          }
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
