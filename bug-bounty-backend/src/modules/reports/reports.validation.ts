import { z } from "zod";

export const createReportSchema = z.object({
  programId: z.uuid(),
  title: z.string().trim().min(5).max(160),
  summary: z.string().trim().min(20).max(10000),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["submitted", "triaged", "resolved", "rejected"]),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
