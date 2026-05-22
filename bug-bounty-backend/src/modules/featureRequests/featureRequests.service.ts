import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  featureRequests,
  featureRequestSubmissions,
  organizations,
  profiles,
} from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import { requireCurrentOrganization } from "../programs/programs.service.js";
import type {
  CreateFeatureRequestInput,
  ReviewFeatureRequestSubmissionInput,
  SubmitFeatureRequestInput,
} from "./featureRequests.validation.js";

export const listOrganizationFeatureRequests = async (profileId: string) => {
  const organization = await requireCurrentOrganization(profileId);
  const rows = await db.query.featureRequests.findMany({
    where: eq(featureRequests.organizationId, organization.id),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  return {
    organization,
    featureRequests: rows.map((request) => toFeatureRequestResponse(request, organization.name)),
  };
};

export const createOrganizationFeatureRequest = async (
  profileId: string,
  input: CreateFeatureRequestInput,
) => {
  const organization = await requireCurrentOrganization(profileId);
  const [request] = await db
    .insert(featureRequests)
    .values({
      organizationId: organization.id,
      title: input.title,
      description: input.description,
      repositoryUrl: input.repositoryUrl,
      bounty: input.bounty,
      status: input.status,
    })
    .returning();

  if (!request) {
    throw new ApiError(400, "Unable to create feature request");
  }

  return toFeatureRequestResponse(request, organization.name);
};

export const listResearcherFeatureRequests = async () => {
  const rows = await db
    .select({
      id: featureRequests.id,
      organizationId: featureRequests.organizationId,
      title: featureRequests.title,
      description: featureRequests.description,
      repositoryUrl: featureRequests.repositoryUrl,
      bounty: featureRequests.bounty,
      status: featureRequests.status,
      createdAt: featureRequests.createdAt,
      updatedAt: featureRequests.updatedAt,
      organizationName: organizations.name,
    })
    .from(featureRequests)
    .innerJoin(organizations, eq(featureRequests.organizationId, organizations.id))
    .orderBy(featureRequests.createdAt);

  return rows.map((request) => toFeatureRequestResponse(request, request.organizationName));
};

export const submitFeatureRequest = async (
  researcherId: string,
  featureRequestId: string,
  input: SubmitFeatureRequestInput,
) => {
  const request = await db.query.featureRequests.findFirst({
    where: eq(featureRequests.id, featureRequestId),
  });

  if (!request) {
    throw new ApiError(404, "Feature request not found");
  }

  const existing = await db.query.featureRequestSubmissions.findFirst({
    where: and(
      eq(featureRequestSubmissions.featureRequestId, featureRequestId),
      eq(featureRequestSubmissions.researcherId, researcherId),
    ),
  });

  if (existing) {
    const [submission] = await db
      .update(featureRequestSubmissions)
      .set({
        submissionUrl: input.submissionUrl,
        status: "submitted",
        updatedAt: new Date(),
      })
      .where(eq(featureRequestSubmissions.id, existing.id))
      .returning();

    if (!submission) {
      throw new ApiError(400, "Unable to update submission");
    }

    return toSubmissionResponse(submission);
  }

  const [submission] = await db
    .insert(featureRequestSubmissions)
    .values({
      featureRequestId,
      researcherId,
      submissionUrl: input.submissionUrl,
      status: "submitted",
    })
    .returning();

  if (!submission) {
    throw new ApiError(400, "Unable to submit feature request");
  }

  return toSubmissionResponse(submission);
};

export const listMyFeatureRequestSubmissions = async (researcherId: string) => {
  const rows = await db.query.featureRequestSubmissions.findMany({
    where: eq(featureRequestSubmissions.researcherId, researcherId),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  return rows.map(toSubmissionResponse);
};

export const listOrganizationFeatureRequestSubmissions = async (profileId: string) => {
  const organization = await requireCurrentOrganization(profileId);
  const rows = await db
    .select({
      id: featureRequestSubmissions.id,
      featureRequestId: featureRequestSubmissions.featureRequestId,
      researcherId: featureRequestSubmissions.researcherId,
      submissionUrl: featureRequestSubmissions.submissionUrl,
      status: featureRequestSubmissions.status,
      createdAt: featureRequestSubmissions.createdAt,
      updatedAt: featureRequestSubmissions.updatedAt,
      featureRequestTitle: featureRequests.title,
      researcherName: profiles.fullName,
      researcherEmail: profiles.email,
    })
    .from(featureRequestSubmissions)
    .innerJoin(featureRequests, eq(featureRequestSubmissions.featureRequestId, featureRequests.id))
    .innerJoin(profiles, eq(featureRequestSubmissions.researcherId, profiles.id))
    .where(eq(featureRequests.organizationId, organization.id))
    .orderBy(featureRequestSubmissions.createdAt);

  return {
    organization,
    submissions: rows.map(toOrganizationSubmissionResponse),
  };
};

export const reviewFeatureRequestSubmission = async (
  profileId: string,
  submissionId: string,
  input: ReviewFeatureRequestSubmissionInput,
) => {
  const organization = await requireCurrentOrganization(profileId);
  const [ownedSubmission] = await db
    .select({
      id: featureRequestSubmissions.id,
    })
    .from(featureRequestSubmissions)
    .innerJoin(featureRequests, eq(featureRequestSubmissions.featureRequestId, featureRequests.id))
    .where(
      and(
        eq(featureRequestSubmissions.id, submissionId),
        eq(featureRequests.organizationId, organization.id),
      ),
    )
    .limit(1);

  if (!ownedSubmission) {
    throw new ApiError(404, "Submission not found");
  }

  const [submission] = await db
    .update(featureRequestSubmissions)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(featureRequestSubmissions.id, submissionId))
    .returning();

  if (!submission) {
    throw new ApiError(400, "Unable to review submission");
  }

  return toSubmissionResponse(submission);
};

type FeatureRequestRow = typeof featureRequests.$inferSelect & {
  organizationName?: string;
};

type OrganizationSubmissionRow = typeof featureRequestSubmissions.$inferSelect & {
  featureRequestTitle: string;
  researcherName: string;
  researcherEmail: string | null;
};

const toFeatureRequestResponse = (request: FeatureRequestRow, organizationName?: string) => ({
  id: request.id,
  organizationId: request.organizationId,
  organizationName,
  title: request.title,
  description: request.description,
  repositoryUrl: request.repositoryUrl,
  bounty: request.bounty,
  status: request.status,
});

const toSubmissionResponse = (submission: typeof featureRequestSubmissions.$inferSelect) => ({
  id: submission.id,
  featureRequestId: submission.featureRequestId,
  researcherId: submission.researcherId,
  submissionUrl: submission.submissionUrl,
  status: submission.status,
  submittedAt: submission.createdAt.toISOString(),
});

const toOrganizationSubmissionResponse = (submission: OrganizationSubmissionRow) => ({
  ...toSubmissionResponse(submission),
  featureRequestTitle: submission.featureRequestTitle,
  researcherName: submission.researcherName,
  researcherEmail: submission.researcherEmail,
});
