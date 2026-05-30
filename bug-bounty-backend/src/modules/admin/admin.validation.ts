import { z } from "zod";

export const releaseEscrowSchema = z.object({
  recipientId: z.uuid(),
  releaseReason: z.string().trim().min(3).max(500),
});

export type ReleaseEscrowInput = z.infer<typeof releaseEscrowSchema>;
