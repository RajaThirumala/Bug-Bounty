import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import {
  createReport,
  organizationReports,
  researcherReports,
  updateReportStatus,
} from "./reports.controller.js";

export const reportsRouter = Router();

reportsRouter.get("/researcher/reports", requireAuth, researcherReports);
reportsRouter.post("/researcher/reports", requireAuth, createReport);
reportsRouter.get("/organization/reports", requireAuth, organizationReports);
reportsRouter.patch("/organization/reports/:reportId/status", requireAuth, updateReportStatus);
