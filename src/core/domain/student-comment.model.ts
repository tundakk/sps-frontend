import { z } from "zod";

export const studentCommentSchema = z.object({
  id: z.string().uuid(),
  commentText: z.string(),
  createdAt: z.coerce.date(),
  studentId: z.string().uuid()
});

export type StudentCommentModel = z.infer<typeof studentCommentSchema>;
