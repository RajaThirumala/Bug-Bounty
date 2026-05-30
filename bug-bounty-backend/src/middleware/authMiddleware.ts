import { findProfileById, getAuthUserFromToken } from "../modules/auth/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token =
    req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    (typeof req.cookies?.access_token === "string" ? req.cookies.access_token : undefined);

  if (!token) {
    throw new ApiError(401, "Supabase access token is required");
  }

  const authUser = await getAuthUserFromToken(token);
  const profile = await findProfileById(authUser.id);

  if (!profile) {
    throw new ApiError(401, "Profile not found");
  }

  req.user = {
    id: authUser.id,
    email: authUser.email ?? "",
    fullName: profile.fullName,
    username: profile.username,
    role: profile.primaryRole,
    onboardingCompleted: profile.onboardingCompleted,
  };

  next();
});
