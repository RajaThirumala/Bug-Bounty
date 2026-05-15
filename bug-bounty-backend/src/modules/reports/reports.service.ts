import { and, eq, inArray, ne } from "drizzle-orm";

import { db } from "../../db/index.js";
import { organizations, programs, reports } from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import { requireCurrentOrganization } from "../programs/programs.service.js";
import type { CreateReportInput, UpdateReportStatusInput } from "./reports.validation.js";

export const createResearcherReport = async (
  researcherId: string,
  input: CreateReportInput,
) => {
  const program = await db.query.programs.findFirst({
    where: and(eq(programs.id, input.programId), ne(programs.status, "paused")),
  });

  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  const [report] = await db
    .insert(reports)
    .values({
      programId: input.programId,
      researcherId,
      title: input.title,
      summary: input.summary,
      severity: input.severity,
      status: "submitted",
    })
    .returning();

  if (!report) {
    throw new ApiError(400, "Unable to submit report");
  }

  return toReportResponse(report, program.name);
};

export const listResearcherReports = async (researcherId: string) => {
  const rows = await db
    .select({
      id: reports.id,
      programId: reports.programId,
      researcherId: reports.researcherId,
      title: reports.title,
      summary: reports.summary,
      severity: reports.severity,
      status: reports.status,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      programName: programs.name,
      organizationName: organizations.name,
    })
    .from(reports)
    .innerJoin(programs, eq(reports.programId, programs.id))
    .innerJoin(organizations, eq(programs.organizationId, organizations.id))
    .where(eq(reports.researcherId, researcherId))
    .orderBy(reports.createdAt);

  return rows.map((report) => toReportResponse(report, report.programName, report.organizationName));
};

export const listOrganizationReports = async (profileId: string) => {
  const organization = await requireCurrentOrganization(profileId);
  const organizationPrograms = await db.query.programs.findMany({
    where: eq(programs.organizationId, organization.id),
  });
  const programIds = organizationPrograms.map((program) => program.id);

  if (programIds.length === 0) {
    return { organization, reports: [] };
  }

  const rows = await db
    .select({
      id: reports.id,
      programId: reports.programId,
      researcherId: reports.researcherId,
      title: reports.title,
      summary: reports.summary,
      severity: reports.severity,
      status: reports.status,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      programName: programs.name,
    })
    .from(reports)
    .innerJoin(programs, eq(reports.programId, programs.id))
    .where(inArray(reports.programId, programIds))
    .orderBy(reports.createdAt);

  return {
    organization,
    reports: rows.map((report) => toReportResponse(report, report.programName, organization.name)),
  };
};

export const updateOrganizationReportStatus = async (
  profileId: string,
  reportId: string,
  input: UpdateReportStatusInput,
) => {
  const organization = await requireCurrentOrganization(profileId);
  const [ownedReport] = await db
    .select({
      id: reports.id,
      programName: programs.name,
    })
    .from(reports)
    .innerJoin(programs, eq(reports.programId, programs.id))
    .where(and(eq(reports.id, reportId), eq(programs.organizationId, organization.id)))
    .limit(1);

  if (!ownedReport) {
    throw new ApiError(404, "Report not found");
  }

  const [report] = await db
    .update(reports)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, reportId))
    .returning();

  if (!report) {
    throw new ApiError(400, "Unable to update report");
  }

  return toReportResponse(report, ownedReport.programName, organization.name);
};

type ReportRow = typeof reports.$inferSelect & {
  programName?: string;
  organizationName?: string;
};

const toReportResponse = (
  report: ReportRow,
  programName?: string,
  organizationName?: string,
) => ({
  id: report.id,
  programId: report.programId,
  researcherId: report.researcherId,
  title: report.title,
  summary: report.summary,
  severity: report.severity,
  status: report.status,
  submittedAt: report.createdAt.toISOString(),
  programName,
  organizationName,
});
