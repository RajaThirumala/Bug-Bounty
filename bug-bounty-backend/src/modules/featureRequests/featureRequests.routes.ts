import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import {
  assignSubmissionTriager,
  createFeatureRequestSubmission,
  createFeatureRequest,
  myFeatureRequestSubmissions,
  organizationFeatureRequests,
  organizationFeatureRequestSubmissions,
  researcherFeatureRequests,
  reviewSubmission,
} from "./featureRequests.controller.js";

export const featureRequestsRouter = Router();

featureRequestsRouter.get("/researcher/feature-requests", requireAuth, researcherFeatureRequests);
featureRequestsRouter.get("/researcher/feature-request-submissions", requireAuth, myFeatureRequestSubmissions);
featureRequestsRouter.post(
  "/researcher/feature-requests/:featureRequestId/submissions",
  requireAuth,
  createFeatureRequestSubmission,
);
featureRequestsRouter.get("/organization/feature-requests", requireAuth, organizationFeatureRequests);
featureRequestsRouter.post("/organization/feature-requests", requireAuth, createFeatureRequest);
featureRequestsRouter.get(
  "/organization/feature-request-submissions",
  requireAuth,
  organizationFeatureRequestSubmissions,
);
featureRequestsRouter.patch(
  "/organization/feature-request-submissions/:submissionId/triager",
  requireAuth,
  assignSubmissionTriager,
);
featureRequestsRouter.patch(
  "/organization/feature-request-submissions/:submissionId",
  requireAuth,
  reviewSubmission,
);
