import { z } from "zod";

export const educationPeriodRateSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  periodId: z.string().uuid(),
  educationId: z.string().uuid()
});

export type EducationPeriodRateModel = z.infer<typeof educationPeriodRateSchema>;
