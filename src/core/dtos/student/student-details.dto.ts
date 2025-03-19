import { z } from "zod";
import { studentDtoSchema } from "./student.dto";

// Education schema
const educationSchema = z.object({
  id: z.string().uuid(),
  name: z.object({
    value: z.string()
  }),
  code: z.string().optional()
});

// Period schema
const periodSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional()
});

// Student comment schema
const studentCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional(),
  createdBy: z.string()
});

// Case schema
const casesSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional()
});

// Extended student schema with relationship data
export const studentDetailsDtoSchema = studentDtoSchema.extend({
  education: educationSchema.nullable().optional(),
  startPeriod: periodSchema.nullable().optional(),
  comments: z.array(studentCommentSchema).default([]),
  spsaCases: z.array(casesSchema).default([])
});

export type StudentDetailsDto = z.infer<typeof studentDetailsDtoSchema>;