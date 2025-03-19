import { z } from "zod";

// Schema for filtering students
export const studentFilterDtoSchema = z.object({
  name: z.string().optional(),
  studentNumber: z.string().optional(),
  cprNumber: z.string().optional(),
  educationId: z.string().uuid("Education ID must be a valid UUID").optional(),
  startPeriodId: z.string().uuid("Start period ID must be a valid UUID").optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional().default("name"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("asc")
});

// Type for filtering students
export type StudentFilterDto = z.infer<typeof studentFilterDtoSchema>;