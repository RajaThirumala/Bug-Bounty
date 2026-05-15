import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import {
  createOrganizationFeatureRequest,
  listOrganizationFeatureRequests,
  listResearcherFeatureRequests,
} from "./featureRequests.service.js";
import { createFeatureRequestSchema } from "./featureRequests.validation.js";

export const researcherFeatureRequests = asyncHandler(async (_req, res) => {
  const featureRequests = await listResearcherFeatureRequests();
  res.json({ featureRequests });
});

export const organizationFeatureRequests = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  res.json(await listOrganizationFeatureRequests(req.user.id));
});

export const createFeatureRequest = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const input = createFeatureRequestSchema.parse(req.body);
  const featureRequest = await createOrganizationFeatureRequest(req.user.id, input);

  res.status(201).json({ featureRequest });
});
