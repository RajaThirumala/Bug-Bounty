import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import { escrowDashboard, releaseEscrowFund } from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.get("/admin/escrows", requireAuth, escrowDashboard);
adminRouter.patch("/admin/escrows/:escrowId/release", requireAuth, releaseEscrowFund);
