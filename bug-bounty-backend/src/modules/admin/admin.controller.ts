import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { listEscrowDashboard, releaseEscrow, requirePlatformAdmin } from "./admin.service.js";
import { releaseEscrowSchema } from "./admin.validation.js";

export const escrowDashboard = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  requirePlatformAdmin(req.user.role);
  res.json(await listEscrowDashboard());
});

export const releaseEscrowFund = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  requirePlatformAdmin(req.user.role);
  const escrowId = req.params.escrowId;
  if (typeof escrowId !== "string") {
    throw new ApiError(400, "escrowId is required");
  }

  const input = releaseEscrowSchema.parse(req.body);
  const escrow = await releaseEscrow(escrowId, input);
  res.json({ escrow });
});
