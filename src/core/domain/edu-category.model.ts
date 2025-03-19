import { z } from "zod";

export const eduCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100)
});

export type EduCategoryModel = z.infer<typeof eduCategorySchema>;
