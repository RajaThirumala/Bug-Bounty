import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { featureRequestsRouter } from "./modules/featureRequests/featureRequests.routes.js";
import { programsRouter } from "./modules/programs/programs.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";
import { teamRouter } from "./modules/team/team.routes.js";

export const app = express();
const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim());

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api", programsRouter);
app.use("/api", reportsRouter);
app.use("/api", featureRequestsRouter);
app.use("/api", teamRouter);

app.use(notFoundHandler);
app.use(errorHandler);
