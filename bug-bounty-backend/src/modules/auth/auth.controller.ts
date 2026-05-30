import type { Response } from "express";
import type { Session } from "@supabase/supabase-js";

import { env } from "../../config/env.js";
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
  updateProfile as updateProfileService,
} from "./auth.service.js";
import {
  createOrganizationSchema,
  loginSchema,
  oauthCompleteSchema,
  registerSchema,
  updateProfileSchema,
} from "./auth.validation.js";

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await registerUser(input);

  setAuthCookies(res, result.session);
  res.status(201).json(toAuthResponse({ ...result, session: null }));
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await loginUser(input);

  setAuthCookies(res, result.session);
  res.json(toAuthResponse({ ...result, session: null }));
});

export const completeOAuth = asyncHandler(async (req, res) => {
  const token = req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new ApiError(401, "Supabase access token is required");
  }

  const input = oauthCompleteSchema.parse(req.body);
  const result = await completeOAuthUser(token, input);

  setAccessTokenCookie(res, token);
  res.json(toAuthResponse({ ...result, session: null }));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const input = updateProfileSchema.parse(req.body);
  const profile = await updateProfileService(req.user.id, input);

  res.json({ user: toUserResponse(req.user, profile) });
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
    typeof req.body?.refreshToken === "string"
      ? req.body.refreshToken
      : typeof req.cookies?.refresh_token === "string"
        ? req.cookies.refresh_token
        : undefined;

  if (!refreshToken) {
    throw new ApiError(400, "refreshToken is required");
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    throw new ApiError(401, error?.message ?? "Invalid refresh token");
  }

  setAuthCookies(res, data.session);
  res.json({
    session: null,
    authUser: {
      id: data.user.id,
      email: data.user.email,
    },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
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

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? "none" : "lax",
  path: "/",
} as const;

const setAccessTokenCookie = (res: Response, accessToken: string, maxAgeSeconds = 60 * 60) => {
  res.cookie("access_token", accessToken, {
    ...cookieOptions,
    maxAge: maxAgeSeconds * 1000,
  });
};

const setAuthCookies = (res: Response, session: unknown) => {
  const authSession = session as Session | null;
  if (!authSession) {
    return;
  }

  setAccessTokenCookie(res, authSession.access_token, authSession.expires_in ?? 60 * 60);
  res.cookie("refresh_token", authSession.refresh_token, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", cookieOptions);
  res.clearCookie("refresh_token", cookieOptions);
};

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
