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
  assignedTriagerId: string | null;
  submittedAt: string;
  programName?: string;
  organizationName?: string;
}

export interface ReportMessage {
  id: string;
  reportId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

export interface ReportDraft {
  programId: string;
  title: string;
  severity: ReportSeverity;
  description: string;
}
