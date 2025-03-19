import { z } from "zod";

export const diagnosisSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100)
});

export type DiagnosisModel = z.infer<typeof diagnosisSchema>;
