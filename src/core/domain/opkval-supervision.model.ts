import { z } from "zod";

export const opkvalSupervisionSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  supervisorName: z.string().optional(),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  hoursSought: z.number(),
  qualificationHoursSpent: z.number(),
  supervisionHoursSpent: z.number(),
  status: z.string().optional()
});

export type OpkvalSupervisionModel = z.infer<typeof opkvalSupervisionSchema>;
