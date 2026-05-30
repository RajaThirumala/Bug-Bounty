import { and, eq, inArray, ne } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  organizationMembers,
  organizations,
  profiles,
  programs,
  reportMessages,
  reports,
} from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import {
  requireCurrentOrganization,
  requireReviewOrganization,
} from "../programs/programs.service.js";
import type {
  AssignReportTriagerInput,
  CreateReportInput,
  CreateReportMessageInput,
  UpdateReportStatusInput,
} from "./reports.validation.js";

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
      assignedTriagerId: reports.assignedTriagerId,
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

export const getAccessibleReport = async (profileId: string, reportId: string) => {
  const [report] = await db
    .select({
      id: reports.id,
      programId: reports.programId,
      researcherId: reports.researcherId,
      title: reports.title,
      summary: reports.summary,
      severity: reports.severity,
      status: reports.status,
      assignedTriagerId: reports.assignedTriagerId,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      programName: programs.name,
      organizationName: organizations.name,
      organizationId: organizations.id,
    })
    .from(reports)
    .innerJoin(programs, eq(reports.programId, programs.id))
    .innerJoin(organizations, eq(programs.organizationId, organizations.id))
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  if (report.researcherId === profileId) {
    return toReportResponse(report, report.programName, report.organizationName);
  }

  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, report.organizationId),
      eq(organizationMembers.profileId, profileId),
      inArray(organizationMembers.role, ["owner", "triager"]),
    ),
  });

  if (!membership) {
    throw new ApiError(404, "Report not found");
  }

  return toReportResponse(report, report.programName, report.organizationName);
};

export const listOrganizationReports = async (profileId: string) => {
  const organization = await requireReviewOrganization(profileId);
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
      assignedTriagerId: reports.assignedTriagerId,
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

export const listReportMessages = async (profileId: string, reportId: string) => {
  await getAccessibleReport(profileId, reportId);

  const rows = await db
    .select({
      id: reportMessages.id,
      reportId: reportMessages.reportId,
      senderId: reportMessages.senderId,
      body: reportMessages.body,
      createdAt: reportMessages.createdAt,
      senderName: profiles.fullName,
      senderRole: profiles.primaryRole,
    })
    .from(reportMessages)
    .innerJoin(profiles, eq(reportMessages.senderId, profiles.id))
    .where(eq(reportMessages.reportId, reportId))
    .orderBy(reportMessages.createdAt);

  return rows.map(toReportMessageResponse);
};

export const createReportMessage = async (
  profileId: string,
  reportId: string,
  input: CreateReportMessageInput,
) => {
  await getAccessibleReport(profileId, reportId);

  const [message] = await db
    .insert(reportMessages)
    .values({
      reportId,
      senderId: profileId,
      body: input.body,
    })
    .returning();

  if (!message) {
    throw new ApiError(400, "Unable to create message");
  }

  const [row] = await db
    .select({
      id: reportMessages.id,
      reportId: reportMessages.reportId,
      senderId: reportMessages.senderId,
      body: reportMessages.body,
      createdAt: reportMessages.createdAt,
      senderName: profiles.fullName,
      senderRole: profiles.primaryRole,
    })
    .from(reportMessages)
    .innerJoin(profiles, eq(reportMessages.senderId, profiles.id))
    .where(eq(reportMessages.id, message.id))
    .limit(1);

  if (!row) {
    throw new ApiError(400, "Unable to load message");
  }

  return toReportMessageResponse(row);
};

export const assignOrganizationReportTriager = async (
  profileId: string,
  reportId: string,
  input: AssignReportTriagerInput,
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

  if (input.triagerId) {
    const triagerMembership = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, organization.id),
        eq(organizationMembers.profileId, input.triagerId),
        eq(organizationMembers.role, "triager"),
      ),
    });

    if (!triagerMembership) {
      throw new ApiError(400, "Triager must belong to this organization");
    }
  }

  const [report] = await db
    .update(reports)
    .set({
      assignedTriagerId: input.triagerId,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, reportId))
    .returning();

  if (!report) {
    throw new ApiError(400, "Unable to assign report");
  }

  return toReportResponse(report, ownedReport.programName, organization.name);
};

export const updateOrganizationReportStatus = async (
  profileId: string,
  reportId: string,
  input: UpdateReportStatusInput,
) => {
  const organization = await requireReviewOrganization(profileId);
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
      ...(input.severity ? { severity: input.severity } : {}),
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

type ReportMessageRow = typeof reportMessages.$inferSelect & {
  senderName: string;
  senderRole: typeof profiles.$inferSelect.primaryRole;
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
  assignedTriagerId: report.assignedTriagerId,
});

const toReportMessageResponse = (message: ReportMessageRow) => ({
  id: message.id,
  reportId: message.reportId,
  senderId: message.senderId,
  senderName: message.senderName,
  senderRole: message.senderRole,
  body: message.body,
  createdAt: message.createdAt.toISOString(),
});
