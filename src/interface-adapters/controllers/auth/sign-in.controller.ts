import { z } from "zod";
import { ServiceResponse, ServiceResponseFactory } from "@/src/core/domain/service-response.model";
import { signInUseCase } from "@/src/application/use-cases/auth/sign-in.use-case";
import { Cookie } from "@/src/core/dtos/cookie.dto";
import { UnauthenticatedError } from "@/src/core/errors/authentication.error";

const inputSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(50),
});

export async function signInController(
  input: Partial<z.infer<typeof inputSchema>>
): Promise<ServiceResponse<Cookie>> {
  try {
    // Validate input
    const validationResult = inputSchema.safeParse(input);
    
    if (!validationResult.success) {
      return ServiceResponseFactory.createValidationError(
        validationResult.error.formErrors.fieldErrors,
        "Invalid login credentials"
      );
    }

    const { cookie } = await signInUseCase(validationResult.data);
    return ServiceResponseFactory.createSuccess(cookie);
  } catch (error: unknown) {
    console.error('Error in signInController:', error);
    
    if (error instanceof UnauthenticatedError) {
      return ServiceResponseFactory.createError<Cookie>(
        error.message,
        'INVALID_CREDENTIALS'
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return ServiceResponseFactory.createError<Cookie>(
      errorMessage,
      'AUTH_ERROR'
    );
  }
}