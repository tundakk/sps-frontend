import { z } from "zod";

export const studentSchema = z.object({
  id: z.string().uuid(),
  studentNumber: z.string().max(50),
  cprNumber: z.string(), // Representing CPRNumber as a string
  name: z.string(),
  finishedDate: z.coerce.date().nullable().optional(),
  startPeriodId: z.string().uuid().nullable().optional(),
  educationId: z.string().uuid().nullable().optional()
});

export type StudentModel = z.infer<typeof studentSchema>;
