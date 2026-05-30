import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  escrowFunds,
  featureRequests,
  featureRequestSubmissions,
  organizations,
  profiles,
  programs,
  reports,
} from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import type { ReleaseEscrowInput } from "./admin.validation.js";

export const requirePlatformAdmin = (role: string) => {
  if (role !== "platform_admin") {
    throw new ApiError(403, "Platform admin access required");
  }
};

export const listEscrowDashboard = async () => {
  const escrows = await db
    .select({
      id: escrowFunds.id,
      organizationId: escrowFunds.organizationId,
      organizationName: organizations.name,
      sourceType: escrowFunds.sourceType,
      sourceId: escrowFunds.sourceId,
      amount: escrowFunds.amount,
      status: escrowFunds.status,
      recipientId: escrowFunds.recipientId,
      releaseReason: escrowFunds.releaseReason,
      releasedAt: escrowFunds.releasedAt,
      createdAt: escrowFunds.createdAt,
    })
    .from(escrowFunds)
    .innerJoin(organizations, eq(escrowFunds.organizationId, organizations.id))
    .orderBy(escrowFunds.createdAt);

  const approvedFeatureSubmissions = await db
    .select({
      submissionId: featureRequestSubmissions.id,
      featureRequestId: featureRequests.id,
      title: featureRequests.title,
      researcherId: featureRequestSubmissions.researcherId,
      researcherName: profiles.fullName,
      submissionUrl: featureRequestSubmissions.submissionUrl,
      amount: featureRequests.bounty,
    })
    .from(featureRequestSubmissions)
    .innerJoin(featureRequests, eq(featureRequestSubmissions.featureRequestId, featureRequests.id))
    .innerJoin(profiles, eq(featureRequestSubmissions.researcherId, profiles.id))
    .where(eq(featureRequestSubmissions.status, "approved"));

  const resolvedReports = await db
    .select({
      reportId: reports.id,
      programId: programs.id,
      title: reports.title,
      researcherId: reports.researcherId,
      researcherName: profiles.fullName,
      amount: programs.maxBounty,
    })
    .from(reports)
    .innerJoin(programs, eq(reports.programId, programs.id))
    .innerJoin(profiles, eq(reports.researcherId, profiles.id))
    .where(eq(reports.status, "resolved"));

  return { escrows, approvedFeatureSubmissions, resolvedReports };
};

export const releaseEscrow = async (escrowId: string, input: ReleaseEscrowInput) => {
  const [escrow] = await db
    .update(escrowFunds)
    .set({
      status: "released",
      recipientId: input.recipientId,
      releaseReason: input.releaseReason,
      releasedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(escrowFunds.id, escrowId))
    .returning();

  if (!escrow) {
    throw new ApiError(404, "Escrow fund not found");
  }

  return escrow;
};
