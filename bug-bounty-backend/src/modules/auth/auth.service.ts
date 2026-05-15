import { eq } from "drizzle-orm";

import { supabase } from "../../config/supabase.js";
import { db } from "../../db/index.js";
import { organizationMembers, organizations, profiles } from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import type { CreateOrganizationInput, LoginInput, OAuthCompleteInput, RegisterInput } from "./auth.validation.js";

export const registerUser = async (input: RegisterInput) => {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.name,
      },
    },
  });

  if (error) {
    throw new ApiError(400, error.message);
  }
  if (!data.user) {
    throw new ApiError(400, "Supabase did not return a user");
  }

  const [profile] = await db
    .insert(profiles)
    .values({
      id: data.user.id,
      fullName: input.name,
      username: input.username,
      primaryRole: input.role ?? "researcher",
      onboardingCompleted: false,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        fullName: input.name,
        username: input.username,
        primaryRole: input.role ?? "researcher",
        onboardingCompleted: false,
        updatedAt: new Date(),
      },
    })
    .returning();

  return { authUser: data.user, profile, session: data.session };
};

export const loginUser = async (input: LoginInput) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user || !data.session) {
    throw new ApiError(401, error?.message ?? "Invalid email or password");
  }

  const profile = await findProfileById(data.user.id);
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return { authUser: data.user, profile, session: data.session };
};

export const completeOAuthUser = async (token: string, input: OAuthCompleteInput) => {
  const authUser = await getAuthUserFromToken(token);
  const existingProfile = await findProfileById(authUser.id);

  if (existingProfile) {
    return { authUser, profile: existingProfile };
  }

  const metadata = authUser.user_metadata;
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : typeof metadata.name === "string" && metadata.name.trim()
        ? metadata.name.trim()
        : authUser.email ?? "GitHub user";

  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  const [profile] = await db
    .insert(profiles)
    .values({
      id: authUser.id,
      fullName,
      avatarUrl,
      primaryRole: input.role ?? "researcher",
      onboardingCompleted: false,
    })
    .returning();

  return { authUser, profile };
};

export const completeResearcherOnboarding = async (profileId: string) => {
  const [profile] = await db
    .update(profiles)
    .set({
      primaryRole: "researcher",
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId))
    .returning();

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return profile;
};

export const completeOrganizationOnboarding = async (
  profileId: string,
  input: CreateOrganizationInput,
) => {
  const slug = await createUniqueOrganizationSlug(input.name);

  return db.transaction(async (tx) => {
    const [organization] = await tx
      .insert(organizations)
      .values({
        name: input.name,
        slug,
        ownerId: profileId,
      })
      .returning();

    if (!organization) {
      throw new ApiError(400, "Unable to create organization");
    }

    await tx.insert(organizationMembers).values({
      organizationId: organization.id,
      profileId,
      role: "owner",
    });

    const [profile] = await tx
      .update(profiles)
      .set({
        primaryRole: "organization_owner",
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
      .returning();

    if (!profile) {
      throw new ApiError(404, "Profile not found");
    }

    return { organization, profile };
  });
};

export const findProfileById = async (id: string) => {
  return db.query.profiles.findFirst({
    where: eq(profiles.id, id),
  });
};

export const getAuthUserFromToken = async (token: string) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new ApiError(401, "Invalid Supabase access token");
  }
  return data.user;
};

const createUniqueOrganizationSlug = async (name: string) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;

  while (await findOrganizationBySlug(slug)) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
};

const findOrganizationBySlug = async (slug: string) => {
  return db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
  });
};

const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `organization-${Date.now()}`;
};
