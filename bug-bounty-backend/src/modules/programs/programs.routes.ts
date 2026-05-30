import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import {
  createProgram,
  meOrganization,
  organizationPrograms,
  researcherProgram,
  researcherPrograms,
  updateProgram,
} from "./programs.controller.js";

export const programsRouter = Router();

programsRouter.get("/researcher/programs", requireAuth, researcherPrograms);
programsRouter.get("/researcher/programs/:programId", requireAuth, researcherProgram);
programsRouter.get("/organization/me", requireAuth, meOrganization);
programsRouter.get("/organization/programs", requireAuth, organizationPrograms);
programsRouter.post("/organization/programs", requireAuth, createProgram);
programsRouter.patch("/organization/programs/:programId", requireAuth, updateProgram);
