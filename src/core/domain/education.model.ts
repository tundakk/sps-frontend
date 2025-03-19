import { z } from "zod";
import { eduCategorySchema } from "./edu-category.model";

export const educationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100),
  eduCategoryId: z.string().uuid(),
  eduCategory: eduCategorySchema.optional()
});

export type EducationModel = z.infer<typeof educationSchema>;
