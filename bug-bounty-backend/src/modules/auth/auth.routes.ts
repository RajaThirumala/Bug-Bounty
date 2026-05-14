import { Router } from "express";

import { requireAuth } from "../../middleware/authMiddleware.js";
import {
  completeOAuth,
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
