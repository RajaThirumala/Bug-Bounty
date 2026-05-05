export type ReportSeverity = "low" | "medium" | "high" | "critical";

export type ReportStatus = "draft" | "submitted" | "triaged" | "resolved";

export interface Report {
  id: string;
  programId: string;
  developerId: string;
  title: string;
  severity: ReportSeverity;
  status: ReportStatus;
  submittedAt?: string;
}

export interface ReportDraft {
  programId: string;
  title: string;
  severity: ReportSeverity;
  description: string;
}
