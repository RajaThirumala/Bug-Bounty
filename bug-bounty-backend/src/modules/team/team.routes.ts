import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import { createTriager, organizationTriagers } from "./team.controller.js";

export const teamRouter = Router();

teamRouter.get("/organization/triagers", requireAuth, organizationTriagers);
teamRouter.post("/organization/triagers", requireAuth, createTriager);
