import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { addTriager, listTriagers } from "./team.service.js";
import { addTriagerSchema } from "./team.validation.js";

export const organizationTriagers = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  res.json(await listTriagers(req.user.id));
});

export const createTriager = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const input = addTriagerSchema.parse(req.body);
  const triager = await addTriager(req.user.id, input);

  res.status(201).json({ triager });
});
