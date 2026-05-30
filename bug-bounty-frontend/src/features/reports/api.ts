import { apiRequest } from "@/lib/api";
import type {
  Report,
  ReportMessage,
  ReportSeverity,
  ReportStatus,
} from "@/features/reports/types";

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

export const getReport = (accessToken: string, reportId: string) =>
  apiRequest<{ report: Report }>(`/api/reports/${reportId}`, { accessToken });

export const getReportMessages = (accessToken: string, reportId: string) =>
  apiRequest<{ messages: ReportMessage[] }>(`/api/reports/${reportId}/messages`, {
    accessToken,
  });

export const createReportMessage = (accessToken: string, reportId: string, body: string) =>
  apiRequest<{ message: ReportMessage }>(`/api/reports/${reportId}/messages`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ body }),
  });

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

export const assignReportTriager = (
  accessToken: string,
  reportId: string,
  triagerId: string | null,
) =>
  apiRequest<{ report: Report }>(`/api/organization/reports/${reportId}/triager`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ triagerId }),
  });
