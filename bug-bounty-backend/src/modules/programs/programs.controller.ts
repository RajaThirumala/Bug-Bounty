import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import {
  createOrganizationProgram,
  getCurrentOrganization,
  getResearcherProgramById,
  listOrganizationPrograms,
  listResearcherPrograms,
} from "./programs.service.js";
import { createProgramSchema } from "./programs.validation.js";

export const meOrganization = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const organization = await getCurrentOrganization(req.user.id);
  res.json({ organization });
});

export const organizationPrograms = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  res.json(await listOrganizationPrograms(req.user.id));
});

export const createProgram = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const input = createProgramSchema.parse(req.body);
  const program = await createOrganizationProgram(req.user.id, input);

  res.status(201).json({ program });
});

export const researcherPrograms = asyncHandler(async (_req, res) => {
  const programs = await listResearcherPrograms();
  res.json({ programs });
});

export const researcherProgram = asyncHandler(async (req, res) => {
  const programId = req.params.programId;
  if (typeof programId !== "string") {
    throw new ApiError(400, "programId is required");
  }

  const program = await getResearcherProgramById(programId);
  res.json({ program });
});
