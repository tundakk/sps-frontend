import { z } from "zod";

export const studentPaymentSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  accountNumber: z.string(),
  amount: z.number(),
  externalVoucherNumber: z.string().max(50).nullable().optional(),
  voucherText: z.string().nullable().optional(),
  completeVoucherText: z.string().nullable().optional(),
  supportTypeId: z.string().uuid().nullable().optional()
});

export type StudentPaymentModel = z.infer<typeof studentPaymentSchema>;
