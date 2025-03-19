import { z } from "zod";

export const eduStatusSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100)
});

export type EduStatusModel = z.infer<typeof eduStatusSchema>;
