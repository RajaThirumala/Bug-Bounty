import { and, eq, inArray } from "drizzle-orm";

import { db } from "../../db/index.js";
import { escrowFunds, organizationMembers, organizations, programs } from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import type { CreateProgramInput, UpdateProgramInput } from "./programs.validation.js";

type OrganizationAccessRole = "owner" | "triager";

export const getCurrentOrganization = async (profileId: string) => {
  return getOrganizationForRole(profileId, ["owner"]);
};

export const getReviewOrganization = async (profileId: string) => {
  return getOrganizationForRole(profileId, ["owner", "triager"]);
};

const getOrganizationForRole = async (profileId: string, roles: OrganizationAccessRole[]) => {
  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.profileId, profileId),
      inArray(organizationMembers.role, roles),
    ),
  });

  if (!membership) {
    return null;
  }

  return db.query.organizations.findFirst({
    where: eq(organizations.id, membership.organizationId),
  });
};

export const requireCurrentOrganization = async (profileId: string) => {
  const organization = await getCurrentOrganization(profileId);

  if (!organization) {
    throw new ApiError(403, "Organization owner access required");
  }

  return organization;
};

export const requireReviewOrganization = async (profileId: string) => {
  const organization = await getReviewOrganization(profileId);

  if (!organization) {
    throw new ApiError(403, "Organization report access required");
  }

  return organization;
};

export const listOrganizationPrograms = async (profileId: string) => {
  const organization = await requireCurrentOrganization(profileId);
  const rows = await db.query.programs.findMany({
    where: eq(programs.organizationId, organization.id),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  return {
    organization,
    programs: rows.map((program) => toProgramResponse(program, organization.name)),
  };
};

export const createOrganizationProgram = async (
  profileId: string,
  input: CreateProgramInput,
) => {
  const organization = await requireCurrentOrganization(profileId);
  const program = await db.transaction(async (tx) => {
    const [createdProgram] = await tx
      .insert(programs)
      .values({
        organizationId: organization.id,
        name: input.name,
        description: input.description,
        minBounty: input.minBounty,
        maxBounty: input.maxBounty,
        status: input.status,
        scope: input.scope,
      })
      .returning();

    if (createdProgram) {
      await tx.insert(escrowFunds).values({
        organizationId: organization.id,
        sourceType: "program",
        sourceId: createdProgram.id,
        amount: input.maxBounty,
      });
    }

    return createdProgram;
  });

  if (!program) {
    throw new ApiError(400, "Unable to create program");
  }

  return toProgramResponse(program, organization.name);
};

export const updateOrganizationProgram = async (
  profileId: string,
  programId: string,
  input: UpdateProgramInput,
) => {
  const organization = await requireCurrentOrganization(profileId);
  const [program] = await db
    .update(programs)
    .set({
      description: input.description,
      status: input.status,
      scope: input.scope,
      updatedAt: new Date(),
    })
    .where(and(eq(programs.id, programId), eq(programs.organizationId, organization.id)))
    .returning();

  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  return toProgramResponse(program, organization.name);
};

export const listResearcherPrograms = async () => {
  const rows = await db
    .select({
      id: programs.id,
      organizationId: programs.organizationId,
      name: programs.name,
      description: programs.description,
      minBounty: programs.minBounty,
      maxBounty: programs.maxBounty,
      status: programs.status,
      scope: programs.scope,
      createdAt: programs.createdAt,
      updatedAt: programs.updatedAt,
      organizationName: organizations.name,
    })
    .from(programs)
    .innerJoin(organizations, eq(programs.organizationId, organizations.id))
    .where(inArray(programs.status, ["active", "paused"]))
    .orderBy(programs.createdAt);

  return rows.map((program) => toProgramResponse(program, program.organizationName));
};

export const getResearcherProgramById = async (programId: string) => {
  const [program] = await db
    .select({
      id: programs.id,
      organizationId: programs.organizationId,
      name: programs.name,
      description: programs.description,
      minBounty: programs.minBounty,
      maxBounty: programs.maxBounty,
      status: programs.status,
      scope: programs.scope,
      createdAt: programs.createdAt,
      updatedAt: programs.updatedAt,
      organizationName: organizations.name,
    })
    .from(programs)
    .innerJoin(organizations, eq(programs.organizationId, organizations.id))
    .where(and(eq(programs.id, programId), inArray(programs.status, ["active", "paused"])))
    .limit(1);

  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  return toProgramResponse(program, program.organizationName);
};

type ProgramRow = typeof programs.$inferSelect & { organizationName?: string };

const toProgramResponse = (program: ProgramRow, organizationName: string) => ({
  id: program.id,
  organizationId: program.organizationId,
  name: program.name,
  organization: organizationName,
  description: program.description,
  minBounty: program.minBounty,
  maxBounty: program.maxBounty,
  status: program.status,
  scope: program.scope,
});
