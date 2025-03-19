import { ServiceResponse, ServiceResponseFactory } from "@/src/core/domain/service-response.model";
import { signOutUseCase } from "@/src/application/use-cases/auth/sign-out.use-case";
import { Cookie } from "@/src/core/dtos/cookie.dto";

export async function signOutController(sessionId: string | null): Promise<ServiceResponse<Cookie | null>> {
  if (!sessionId) {
    return ServiceResponseFactory.createSuccess(null);
  }
  
  try {
    // Existing logic to handle signout
    const { blankCookie } = await signOutUseCase(sessionId);
    return ServiceResponseFactory.createSuccess(blankCookie);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to sign out";
    const errorCode = "AUTH_SIGNOUT_ERROR";
    
    return ServiceResponseFactory.createError(
      errorMessage,
      errorCode
    );
  }
}
