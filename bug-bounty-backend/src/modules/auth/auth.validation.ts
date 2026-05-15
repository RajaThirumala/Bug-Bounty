import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  username: z.string().trim().min(3).max(40).optional(),
  role: z
    .enum([
      "researcher",
      "organization_owner",
    ])
    .optional(),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export const oauthCompleteSchema = z.object({
  role: z
    .enum([
      "researcher",
      "organization_owner",
    ])
    .optional(),
});

export const chooseResearcherSchema = z.object({});

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OAuthCompleteInput = z.infer<typeof oauthCompleteSchema>;
export type ChooseResearcherInput = z.infer<typeof chooseResearcherSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
