import { z } from "zod";

export const createFeatureRequestSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(10).max(5000),
  bounty: z.coerce.number().int().min(0),
  status: z.enum(["open", "planned", "in_progress", "completed"]).default("open"),
});

export type CreateFeatureRequestInput = z.infer<typeof createFeatureRequestSchema>;
