import { z } from "zod";

export const addTriagerSchema = z.object({
  email: z.email().toLowerCase(),
});

export type AddTriagerInput = z.infer<typeof addTriagerSchema>;
