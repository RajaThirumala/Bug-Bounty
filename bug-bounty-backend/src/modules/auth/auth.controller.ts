import { supabase } from "../../config/supabase.js";
import type { Profile } from "../../db/schema/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import {
  completeOAuthUser,
  completeOrganizationOnboarding,
  completeResearcherOnboarding,
  loginUser,
  registerUser,
} from "./auth.service.js";
import {
  createOrganizationSchema,
  loginSchema,
  oauthCompleteSchema,
  registerSchema,
} from "./auth.validation.js";

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await registerUser(input);

  res.status(201).json(toAuthResponse(result));
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await loginUser(input);

  res.json(toAuthResponse(result));
});

export const completeOAuth = asyncHandler(async (req, res) => {
  const token = req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new ApiError(401, "Supabase access token is required");
  }

  const input = oauthCompleteSchema.parse(req.body);
  const result = await completeOAuthUser(token, input);

  res.json(toAuthResponse({ ...result, session: null }));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const chooseResearcher = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const profile = await completeResearcherOnboarding(req.user.id);
  res.json({ user: toUserResponse(req.user, profile) });
});

export const createOrganization = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const input = createOrganizationSchema.parse(req.body);
  const { organization, profile } = await completeOrganizationOnboarding(req.user.id, input);

  res.status(201).json({
    organization,
    user: toUserResponse(req.user, profile),
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken =
    typeof req.body?.refreshToken === "string" ? req.body.refreshToken : undefined;

  if (!refreshToken) {
    throw new ApiError(400, "refreshToken is required");
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    throw new ApiError(401, error?.message ?? "Invalid refresh token");
  }

  res.json({
    session: data.session,
    authUser: {
      id: data.user.id,
      email: data.user.email,
    },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.status(204).send();
});

const toAuthResponse = ({
  authUser,
  profile,
  session,
}: {
  authUser: { id: string; email?: string };
  profile: Profile;
  session: unknown;
}) => ({
  session,
  user: {
    id: authUser.id,
    email: authUser.email,
    fullName: profile.fullName,
    username: profile.username,
    role: profile.primaryRole,
    onboardingCompleted: profile.onboardingCompleted,
  },
});

const toUserResponse = (
  authUser: { id: string; email?: string },
  profile: Profile,
) => ({
  id: authUser.id,
  email: authUser.email,
  fullName: profile.fullName,
  username: profile.username,
  role: profile.primaryRole,
  onboardingCompleted: profile.onboardingCompleted,
});
