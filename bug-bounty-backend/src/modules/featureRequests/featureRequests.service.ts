import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { featureRequests, organizations } from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import { requireCurrentOrganization } from "../programs/programs.service.js";
import type { CreateFeatureRequestInput } from "./featureRequests.validation.js";

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

type FeatureRequestRow = typeof featureRequests.$inferSelect & {
  organizationName?: string;
};

const toFeatureRequestResponse = (request: FeatureRequestRow, organizationName?: string) => ({
  id: request.id,
  organizationId: request.organizationId,
  organizationName,
  title: request.title,
  description: request.description,
  bounty: request.bounty,
  status: request.status,
});
