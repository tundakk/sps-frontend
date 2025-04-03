import { z } from "zod";
import { studentDtoSchema } from "./student.dto";

// Extend the student schema with additional details
export const studentDetailsDtoSchema = studentDtoSchema.extend({
  // Additional fields specific to student details can be added here
  comments: z.array(z.object({
    id: z.string().uuid(),
    text: z.string(),
    studentId: z.string().uuid(),
    createdBy: z.string().optional(),
    createdAt: z.string().nullable().or(z.date()).optional(),
  })).default([]),
  
  spsaCases: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    studentId: z.string().uuid(),
    status: z.string().optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
    createdAt: z.string().nullable().or(z.date()).optional(),
    updatedAt: z.string().nullable().or(z.date()).optional()
  })).default([]),
  
  // We now inherit createdBy and updatedBy from the parent schema
  // since we added them to studentDtoSchema
});

export type StudentDetailsDto = z.infer<typeof studentDetailsDtoSchema>;