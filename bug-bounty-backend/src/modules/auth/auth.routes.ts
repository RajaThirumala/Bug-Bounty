import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import {
  chooseResearcher,
  completeOAuth,
  createOrganization,
  login,
  logout,
  me,
  refresh,
  register,
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/oauth/complete", completeOAuth);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.post("/onboarding/researcher", requireAuth, chooseResearcher);
authRouter.post("/onboarding/organization", requireAuth, createOrganization);
