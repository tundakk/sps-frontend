import { z } from "zod";

export const supportingTeacherSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100),
  email: z.string().email(),
  placesId: z.string().uuid().nullable().optional()
});

export type SupportingTeacherModel = z.infer<typeof supportingTeacherSchema>;
