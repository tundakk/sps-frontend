import { Cookie } from "@/src/core/dtos/cookie.dto";
import { UserDto } from "@/src/core/dtos/user/user.dto";

export interface IAuthenticationService {
  /**
   * Authenticates a user with username and password
   */
  signIn(username: string, password: string): Promise<{ 
    cookie: Cookie;
    tokens: { 
      accessToken: string; 
      refreshToken: string | null;
    }
  }>;
  
  /**
   * Refreshes an authentication token
   */
  refreshToken(sessionId: string): Promise<{
    cookie: Cookie;
    tokens: { 
      accessToken: string; 
      refreshToken: string | null 
    }
  }>;
  
  /**
   * Signs out a user and invalidates their session
   */
  signOut(sessionId: string): Promise<{ blankCookie: Cookie }>;
  
  /**
   * Validates if a session exists and is valid
   */
  validateSession(sessionId: string): Promise<{ session: { userId: string } }>;
  
  /**
   * Gets the current authenticated user information
   */
  getCurrentUser(sessionId: string): Promise<UserDto>;
}