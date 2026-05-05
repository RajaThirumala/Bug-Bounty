import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
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
import { mockPrograms } from "@/features/programs";
import { mockReports, type ReportStatus } from "@/features/reports";

const statusLabels: Record<ReportStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  triaged: "Triaged",
  resolved: "Resolved",
};

export default function OrganizationReports() {
  const programs = mockPrograms.filter((program) => program.organizationId === "org-acme");
  const programIds = programs.map((program) => program.id);
  const reports = mockReports.filter((report) => programIds.includes(report.programId));

  return (
    <div>
      <PageHeader
        title="Submitted Reports"
        description="Review incoming vulnerability reports and update their status."
      />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const program = programs.find((item) => item.id === report.programId);
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{program?.name ?? report.programId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{report.severity}</Badge>
                    </TableCell>
                    <TableCell className="w-44">
                      <Select defaultValue={report.status}>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
