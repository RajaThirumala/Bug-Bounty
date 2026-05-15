import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import {
  createFeatureRequest,
  organizationFeatureRequests,
  researcherFeatureRequests,
} from "./featureRequests.controller.js";

export const featureRequestsRouter = Router();

featureRequestsRouter.get("/researcher/feature-requests", requireAuth, researcherFeatureRequests);
featureRequestsRouter.get("/organization/feature-requests", requireAuth, organizationFeatureRequests);
featureRequestsRouter.post("/organization/feature-requests", requireAuth, createFeatureRequest);
