import { apiRequest } from "@/lib/api";
import type { Report, ReportSeverity, ReportStatus } from "@/features/reports/types";

export interface CreateReportInput {
  programId: string;
  title: string;
  summary: string;
  severity: ReportSeverity;
}

export const createReport = (accessToken: string, input: CreateReportInput) =>
  apiRequest<{ report: Report }>("/api/researcher/reports", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });

export const getResearcherReports = (accessToken: string) =>
  apiRequest<{ reports: Report[] }>("/api/researcher/reports", { accessToken });

export const getOrganizationReports = (accessToken: string) =>
  apiRequest<{ reports: Report[] }>("/api/organization/reports", { accessToken });

export const updateReportStatus = (
  accessToken: string,
  reportId: string,
  status: ReportStatus,
  severity?: ReportSeverity,
) =>
  apiRequest<{ report: Report }>(`/api/organization/reports/${reportId}/status`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ status, severity }),
  });
