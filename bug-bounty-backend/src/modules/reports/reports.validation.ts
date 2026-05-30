import { z } from "zod";

export const createReportSchema = z.object({
  programId: z.uuid(),
  title: z.string().trim().min(5).max(160),
  summary: z.string().trim().min(20).max(10000),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["submitted", "triaged", "resolved", "rejected"]),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const createReportMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const assignReportTriagerSchema = z.object({
  triagerId: z.uuid().nullable(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type CreateReportMessageInput = z.infer<typeof createReportMessageSchema>;
export type AssignReportTriagerInput = z.infer<typeof assignReportTriagerSchema>;
