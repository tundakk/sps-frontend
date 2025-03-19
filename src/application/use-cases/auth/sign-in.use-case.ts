import { getInjection } from "@/src/di/container";
import { Cookie } from "@/src/core/dtos/cookie.dto";
import { AuthenticationError } from "@/src/core/errors/authentication.error";
import { jwtDecode } from "jwt-decode";

// Define proper type for decoded token
interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  roles?: string[];
  [key: string]: unknown;
}

export interface SignInResult {
  cookie: Cookie;
  session: {
    userId: string;
  };
}

export async function signInUseCase(input: {
  username: string;
  password: string;
}): Promise<SignInResult> {
  const authenticationService = getInjection("IAuthenticationService");
  
  try {
    const authResponse = await authenticationService.signIn(input.username, input.password);
    
    // Extract user ID from JWT token payload using proper typing
    try {
      const decodedToken = jwtDecode<DecodedToken>(authResponse.tokens.accessToken);
      
      if (!decodedToken.sub) {
        throw new Error("Invalid token: missing subject claim");
      }
      
      return { 
        cookie: authResponse.cookie,
        session: {
          userId: decodedToken.sub
        }
      };
    } catch (decodeError) {
      console.error("Error decoding JWT token", decodeError);
      throw new AuthenticationError("Failed to process authentication token", { cause: decodeError });
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError("Authentication failed", { cause: error });
  }
}