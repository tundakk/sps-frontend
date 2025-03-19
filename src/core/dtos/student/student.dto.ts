import { z } from "zod";

// Define the value object schemas
const valueObjectSchema = z.object({
  value: z.string()
});

export const studentDtoSchema = z.object({
  id: z.string().uuid(),
  studentNumber: z.string().max(50),
  // Updated to match nested object structure
  cprNumber: valueObjectSchema,
  name: valueObjectSchema,
  // New fields from actual API response
  comments: z.array(z.any()).default([]),
  finishedDate: z.string().nullable().or(z.date()).nullable().optional(),
  startPeriodId: z.string().uuid().nullable().optional(),
  startPeriod: z.any().nullable().optional(),
  educationId: z.string().uuid().nullable().optional(),
  education: z.any().nullable().optional(),
  spsaCases: z.array(z.any()).default([])
});

export type StudentDto = z.infer<typeof studentDtoSchema>;