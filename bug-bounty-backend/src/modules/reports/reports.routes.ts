import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import {
  createReport,
  organizationReports,
  postReportMessage,
  reportDetail,
  reportMessages,
  researcherReports,
  updateReportStatus,
} from "./reports.controller.js";

export const reportsRouter = Router();

reportsRouter.get("/researcher/reports", requireAuth, researcherReports);
reportsRouter.post("/researcher/reports", requireAuth, createReport);
reportsRouter.get("/organization/reports", requireAuth, organizationReports);
reportsRouter.patch("/organization/reports/:reportId/status", requireAuth, updateReportStatus);
reportsRouter.get("/reports/:reportId", requireAuth, reportDetail);
reportsRouter.get("/reports/:reportId/messages", requireAuth, reportMessages);
reportsRouter.post("/reports/:reportId/messages", requireAuth, postReportMessage);
