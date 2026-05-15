export type ReportSeverity = "low" | "medium" | "high" | "critical";

export type ReportStatus = "submitted" | "triaged" | "resolved" | "rejected";

export interface Report {
  id: string;
  programId: string;
  researcherId: string;
  title: string;
  summary: string;
  severity: ReportSeverity;
  status: ReportStatus;
  submittedAt: string;
  programName?: string;
  organizationName?: string;
}

export interface ReportDraft {
  programId: string;
  title: string;
  severity: ReportSeverity;
  description: string;
}
