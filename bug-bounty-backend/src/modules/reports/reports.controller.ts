import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import {
  createReportMessage,
  createResearcherReport,
  getAccessibleReport,
  listOrganizationReports,
  listReportMessages,
  listResearcherReports,
  updateOrganizationReportStatus,
} from "./reports.service.js";
import {
  createReportMessageSchema,
  createReportSchema,
  updateReportStatusSchema,
} from "./reports.validation.js";

export const createReport = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const input = createReportSchema.parse(req.body);
  const report = await createResearcherReport(req.user.id, input);

  res.status(201).json({ report });
});

export const researcherReports = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const reports = await listResearcherReports(req.user.id);
  res.json({ reports });
});

export const organizationReports = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  res.json(await listOrganizationReports(req.user.id));
});

export const reportDetail = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const reportId = req.params.reportId;
  if (typeof reportId !== "string") {
    throw new ApiError(400, "reportId is required");
  }

  const report = await getAccessibleReport(req.user.id, reportId);
  res.json({ report });
});

export const reportMessages = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const reportId = req.params.reportId;
  if (typeof reportId !== "string") {
    throw new ApiError(400, "reportId is required");
  }

  const messages = await listReportMessages(req.user.id, reportId);
  res.json({ messages });
});

export const postReportMessage = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const reportId = req.params.reportId;
  if (typeof reportId !== "string") {
    throw new ApiError(400, "reportId is required");
  }

  const input = createReportMessageSchema.parse(req.body);
  const message = await createReportMessage(req.user.id, reportId, input);
  res.status(201).json({ message });
});

export const updateReportStatus = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const reportId = req.params.reportId;
  if (typeof reportId !== "string") {
    throw new ApiError(400, "reportId is required");
  }

  const input = updateReportStatusSchema.parse(req.body);
  const report = await updateOrganizationReportStatus(req.user.id, reportId, input);

  res.json({ report });
});
