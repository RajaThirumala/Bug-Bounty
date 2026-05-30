import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import {
  assignFeatureRequestSubmissionTriager,
  createOrganizationFeatureRequest,
  listMyFeatureRequestSubmissions,
  listOrganizationFeatureRequests,
  listOrganizationFeatureRequestSubmissions,
  listResearcherFeatureRequests,
  reviewFeatureRequestSubmission,
  submitFeatureRequest,
} from "./featureRequests.service.js";
import {
  assignFeatureRequestSubmissionTriagerSchema,
  createFeatureRequestSchema,
  reviewFeatureRequestSubmissionSchema,
  submitFeatureRequestSchema,
} from "./featureRequests.validation.js";

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

export const myFeatureRequestSubmissions = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const submissions = await listMyFeatureRequestSubmissions(req.user.id);
  res.json({ submissions });
});

export const createFeatureRequestSubmission = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const featureRequestId = req.params.featureRequestId;
  if (typeof featureRequestId !== "string") {
    throw new ApiError(400, "featureRequestId is required");
  }

  const input = submitFeatureRequestSchema.parse(req.body);
  const submission = await submitFeatureRequest(req.user.id, featureRequestId, input);
  res.status(201).json({ submission });
});

export const organizationFeatureRequestSubmissions = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  res.json(await listOrganizationFeatureRequestSubmissions(req.user.id));
});

export const assignSubmissionTriager = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const submissionId = req.params.submissionId;
  if (typeof submissionId !== "string") {
    throw new ApiError(400, "submissionId is required");
  }

  const input = assignFeatureRequestSubmissionTriagerSchema.parse(req.body);
  const submission = await assignFeatureRequestSubmissionTriager(req.user.id, submissionId, input);
  res.json({ submission });
});

export const reviewSubmission = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const submissionId = req.params.submissionId;
  if (typeof submissionId !== "string") {
    throw new ApiError(400, "submissionId is required");
  }

  const input = reviewFeatureRequestSubmissionSchema.parse(req.body);
  const submission = await reviewFeatureRequestSubmission(req.user.id, submissionId, input);
  res.json({ submission });
});
