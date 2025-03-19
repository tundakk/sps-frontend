import { z } from "zod";

export const periodSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(10)
});

export type PeriodModel = z.infer<typeof periodSchema>;
