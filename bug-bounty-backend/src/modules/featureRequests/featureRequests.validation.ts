import { z } from "zod";

export const createFeatureRequestSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(10).max(5000),
  repositoryUrl: z.url().refine((value) => value.includes("github.com"), {
    message: "Repository URL must be a GitHub link",
  }),
  bounty: z.coerce.number().int().min(0),
  status: z.enum(["open", "planned", "in_progress", "completed"]).default("open"),
});

export const submitFeatureRequestSchema = z.object({
  submissionUrl: z.url().refine((value) => value.includes("github.com"), {
    message: "Submission URL must be a GitHub link",
  }),
});

export const reviewFeatureRequestSubmissionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export type CreateFeatureRequestInput = z.infer<typeof createFeatureRequestSchema>;
export type SubmitFeatureRequestInput = z.infer<typeof submitFeatureRequestSchema>;
export type ReviewFeatureRequestSubmissionInput = z.infer<
  typeof reviewFeatureRequestSubmissionSchema
>;
