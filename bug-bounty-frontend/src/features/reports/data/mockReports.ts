import type { Report } from "@/features/reports/types";

// TODO: Replace mock reports with API data when backend integration starts.
export const mockReports: Report[] = [
  {
    id: "report-001",
    programId: "acme-web",
    developerId: "user-jane-developer",
    title: "Stored XSS in profile bio",
    severity: "high",
    status: "triaged",
    submittedAt: "2026-04-28",
  },
  {
    id: "report-002",
    programId: "northwind-api",
    developerId: "user-jane-developer",
    title: "Broken object authorization on shipment lookup",
    severity: "critical",
    status: "submitted",
    submittedAt: "2026-05-01",
  },
  {
    id: "report-003",
    programId: "acme-web",
    developerId: "user-sam-developer",
    title: "Missing rate limit on password reset",
    severity: "medium",
    status: "resolved",
    submittedAt: "2026-04-20",
  },
];
