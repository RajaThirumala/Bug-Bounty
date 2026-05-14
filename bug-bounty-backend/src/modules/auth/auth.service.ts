import { eq } from "drizzle-orm";

import { supabase } from "../../config/supabase.js";
import { db } from "../../db/index.js";
import { profiles } from "../../db/schema/index.js";
import { ApiError } from "../../utils/apiError.js";
import type { LoginInput, OAuthCompleteInput, RegisterInput } from "./auth.validation.js";

export const registerUser = async (input: RegisterInput) => {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.name,
        primary_role: input.role,
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
      primaryRole: input.role,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        fullName: input.name,
        username: input.username,
        primaryRole: input.role,
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
      primaryRole: input.role,
    })
    .returning();

  return { authUser, profile };
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
