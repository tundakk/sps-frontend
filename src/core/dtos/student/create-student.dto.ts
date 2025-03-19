import { z } from "zod";

// Define the value object schema
const valueObjectSchema = z.object({
  value: z.string().min(1, "Value is required")
});

// Schema for creating a student
export const createStudentDtoSchema = z.object({
  name: valueObjectSchema.refine(
    data => data.value.length >= 2,
    { message: "Name must be at least 2 characters", path: ['value'] }
  ),
  studentNumber: z.string().min(1, "Student number is required"),
  cprNumber: valueObjectSchema.refine(
    data => /^\d{10}$/.test(data.value),
    { message: "CPR number must be 10 digits", path: ['value'] }
  ),
  educationId: z.string().uuid("Education ID must be a valid UUID"),
  startPeriodId: z.string().uuid("Start period ID must be a valid UUID")
});

// Type for creating a student
export type CreateStudentDto = z.infer<typeof createStudentDtoSchema>;