import { z } from "zod";

export const supportTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100)
});

export type SupportTypeModel = z.infer<typeof supportTypeSchema>;
