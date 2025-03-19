import { ServiceResponse } from "@/src/core/domain/service-response.model";

type ActionErrorResponse = { error: string };
type ActionRedirectResponse = { redirect: string };

/**
 * Handles controller responses in server actions with standardized error handling
 */
export async function handleControllerResponse<T, R = void>(
  controllerFn: () => Promise<ServiceResponse<T>>,
  options: {
    onSuccess?: (data: T) => R | Promise<R>;
    onError?: (error: Error | string) => ActionErrorResponse;
    defaultErrorMessage?: string;
    redirectTo?: string;
  }
): Promise<R | ActionErrorResponse | ActionRedirectResponse> {
  try {
    const response = await controllerFn();
    
    if (!response.success) {
      // Handle API errors (validation, not found, etc.)
      const errorMessage = response.message || options.defaultErrorMessage || "An error occurred";
      return options.onError ? 
        options.onError(errorMessage) : 
        { error: errorMessage };
    }
    
    // Handle successful response
    let result: R | undefined;
    if (options.onSuccess) {
      result = await options.onSuccess(response.data as T);
    }
    
    // Return redirect info instead of calling redirect directly
    if (options.redirectTo) {
      return { redirect: options.redirectTo };
    }
    
    return result as R;
  } catch (err) {
    console.error("Action error:", err);
    const errorMessage = err instanceof Error ? 
      err.message : 
      options.defaultErrorMessage || "An unexpected error occurred";
      
    return options.onError ? 
      options.onError(err as Error) : 
      { error: errorMessage };
  }
}
