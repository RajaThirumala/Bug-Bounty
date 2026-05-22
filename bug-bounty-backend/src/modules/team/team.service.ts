import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { organizationMembers, profiles } from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import { requireCurrentOrganization } from "../programs/programs.service.js";
import type { AddTriagerInput } from "./team.validation.js";

export const listTriagers = async (ownerId: string) => {
  const organization = await requireCurrentOrganization(ownerId);
  const rows = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      username: profiles.username,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(profiles, eq(organizationMembers.profileId, profiles.id))
    .where(
      and(
        eq(organizationMembers.organizationId, organization.id),
        eq(organizationMembers.role, "triager"),
      ),
    );

  return { organization, triagers: rows };
};

export const addTriager = async (ownerId: string, input: AddTriagerInput) => {
  const organization = await requireCurrentOrganization(ownerId);
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.email, input.email),
  });

  if (!profile) {
    throw new ApiError(404, "No user found with that email");
  }

  if (profile.id === ownerId) {
    throw new ApiError(400, "Owner is already assigned to this organization");
  }

  const existing = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organization.id),
      eq(organizationMembers.profileId, profile.id),
    ),
  });

  await db.transaction(async (tx) => {
    if (existing) {
      await tx
        .update(organizationMembers)
        .set({ role: "triager", updatedAt: new Date() })
        .where(eq(organizationMembers.id, existing.id));
    } else {
      await tx.insert(organizationMembers).values({
        organizationId: organization.id,
        profileId: profile.id,
        role: "triager",
      });
    }

    await tx
      .update(profiles)
      .set({ primaryRole: "triager", updatedAt: new Date() })
      .where(eq(profiles.id, profile.id));
  });

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    username: profile.username,
    role: "triager" as const,
  };
};
