import { z } from "zod";

/**
 * Generic schema that matches the backend ServiceResponse<T> pattern
 */
export const createServiceResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable().optional(),
    success: z.boolean().default(true),
    message: z.string().default(""),
    errorCode: z.string().default(""),
    validationErrors: z.record(z.array(z.string())).nullable().optional(),
    technicalDetails: z.string().nullable().optional()
  });

export type ServiceResponse<T> = {
  data?: T | null;
  success: boolean;
  message: string;
  errorCode: string;
  validationErrors?: Record<string, string[]> | null;
  technicalDetails?: string | null;
};

/**
 * Helper methods mirroring backend functionality
 */
export const ServiceResponseFactory = {
  createSuccess: <T>(data: T): ServiceResponse<T> => ({
    success: true,
    data,
    message: "",
    errorCode: ""
  }),

  createError: <T>(message: string, errorCode = ""): ServiceResponse<T> => ({
    success: false,
    message,
    errorCode,
    data: null
  }),

  createValidationError: <T>(
    validationErrors: Record<string, string[]>,
    message = "Validation failed"
  ): ServiceResponse<T> => ({
    success: false,
    message,
    errorCode: "VALIDATION_ERROR",
    validationErrors,
    data: null
  }),

  createNotFound: <T>(message = "Resource not found"): ServiceResponse<T> => ({
    success: false,
    message,
    errorCode: "NOT_FOUND",
    data: null
  })
};