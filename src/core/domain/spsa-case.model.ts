import { z } from "zod";

// First define the comment schema for the case
export const spsaCaseCommentSchema = z.object({
  id: z.string().uuid(),
  commentText: z.string(),
  createdAt: z.coerce.date(),
  spsaCaseId: z.string().uuid()
});

export const spsaCaseSchema = z.object({
  id: z.string().uuid(),
  spsaCaseNumber: z.string().max(50),
  hoursSought: z.number(),
  hoursSpent: z.number(),
  comment: z.string().optional(),
  comments: z.array(spsaCaseCommentSchema).optional(),
  isActive: z.boolean(),
  applicationDate: z.coerce.date().nullable().optional(),
  latestReapplicationDate: z.coerce.date().nullable().optional(),
  courseDescriptionReceived: z.boolean(),
  timesheetReceived: z.boolean(),
  studentRefundReleased: z.boolean(),
  teacherRefundReleased: z.boolean(),
  supportRate: z.number(),
  studentId: z.string().uuid(),
  supportingTeacherId: z.string().uuid().nullable().optional(),
  appliedPeriodId: z.string().uuid().nullable().optional(),
  diagnosisId: z.string().uuid().nullable().optional(),
  eduCategoryId: z.string().uuid().nullable().optional(),
  supportTypeId: z.string().uuid().nullable().optional(),
  eduStatusId: z.string().uuid().nullable().optional(),
  teacherPaymentId: z.string().uuid().nullable().optional(),
  opkvalSupervisionId: z.string().uuid().nullable().optional(),
  studentPaymentId: z.string().uuid().nullable().optional(),
});

export type SpsaCaseCommentModel = z.infer<typeof spsaCaseCommentSchema>;
export type SpsaCaseModel = z.infer<typeof spsaCaseSchema>;
