import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { getOrganizationReports, updateReportStatus, type ReportStatus } from "@/features/reports";
import { useAuthStore } from "@/features/auth";

const statusLabels: Record<ReportStatus, string> = {
  submitted: "Submitted",
  triaged: "Triaged",
  resolved: "Resolved",
  rejected: "Rejected",
};

export default function OrganizationReports() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [draftStatuses, setDraftStatuses] = useState<Record<string, ReportStatus>>({});
  const { data, isLoading, error } = useQuery({
    queryKey: ["organization-reports"],
    queryFn: () => getOrganizationReports(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const mutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: ReportStatus }) =>
      updateReportStatus(accessToken ?? "", reportId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization-reports"] });
    },
  });
  const reports = data?.reports ?? [];

  useEffect(() => {
    setDraftStatuses(
      Object.fromEntries(reports.map((report) => [report.id, report.status])),
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
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.programName ?? report.programId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{report.severity}</Badge>
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
                      <Button
                        size="sm"
                        disabled={
                          mutation.isPending ||
                          (draftStatuses[report.id] ?? report.status) === report.status
                        }
                        onClick={() =>
                          mutation.mutate({
                            reportId: report.id,
                            status: draftStatuses[report.id] ?? report.status,
                          })
                        }
                      >
                        Update
                      </Button>
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
