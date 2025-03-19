import { z } from "zod";

export const commentSchema = z.object({
  id: z.string().uuid(),
  commentText: z.string(),
  createdAt: z.coerce.date(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  createdBy: z.string().nullable().optional(),
  entityName: z.string().nullable().optional()
});

export type CommentModel = z.infer<typeof commentSchema>;
