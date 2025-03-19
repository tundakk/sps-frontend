import { getInjection } from "@/src/di/container";
import { Cookie } from "@/src/core/dtos/cookie.dto";

export function signOutUseCase(
  sessionId: string,
): Promise<{ blankCookie: Cookie }> {
    const authenticationService = getInjection("IAuthenticationService");

    return authenticationService.signOut(sessionId);
 
}
