import { z } from "zod";

export const teacherPaymentSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  amount: z.number(),
  externalVoucherNumber: z.string().max(50).nullable().optional(),
  voucherText: z.string().nullable().optional(),
  completeVoucherText: z.string().nullable().optional(),
  supportTypeId: z.string().uuid().nullable().optional()
});

export type TeacherPaymentModel = z.infer<typeof teacherPaymentSchema>;
