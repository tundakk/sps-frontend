import { z } from "zod";

// Define the value object schema
const valueObjectSchema = z.object({
  value: z.string().min(1, "Value is required")
});

// Schema for updating a student - all fields are optional
export const updateStudentDtoSchema = z.object({
  name: valueObjectSchema.refine(
    data => data.value.length >= 2,
    { message: "Name must be at least 2 characters", path: ['value'] }
  ).optional(),
  studentNumber: z.string().min(1, "Student number is required").optional(),
  cprNumber: valueObjectSchema.refine(
    data => /^\d{10}$/.test(data.value),
    { message: "CPR number must be 10 digits", path: ['value'] }
  ).optional(),
  educationId: z.string().uuid("Education ID must be a valid UUID").optional(),
  startPeriodId: z.string().uuid("Start period ID must be a valid UUID").optional(),
  finishedDate: z.string().nullable().or(z.date().nullable()).optional()
});

// Type for updating a student
export type UpdateStudentDto = z.infer<typeof updateStudentDtoSchema>;