import { z } from "zod";

export const createProgramSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(5000),
    minBounty: z.coerce.number().int().min(0),
    maxBounty: z.coerce.number().int().min(0),
    status: z.enum(["active", "paused", "private"]).default("private"),
    scope: z.array(z.string().trim().min(1).max(200)).min(1).max(50),
  })
  .refine((input) => input.maxBounty >= input.minBounty, {
    message: "Maximum bounty must be greater than or equal to minimum bounty",
    path: ["maxBounty"],
  });

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
