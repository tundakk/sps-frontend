import { Cookie } from "@/src/core/dtos/cookie.dto";

/**
 * Session data structure
 */
export interface SessionData {
  id?: string;   
  userId: string;
  token?: string;
  tokenExpires?: string;
  expiresAt: Date;
  // Add any other session data needed
}

/**
 * Interface for session management services
 */
export interface ISessionService {
  /**
   * Creates a new session for a user
   * @param userId The user ID
   * @param data Additional session data
   * @returns The session ID
   */
  createSession(userId: string, data?: Partial<Omit<SessionData, 'userId'>>): Promise<string>;

  /**
   * Gets a session by ID
   * @param sessionId The session ID
   * @returns The session data or null if not found
   */
  getSession(sessionId: string): Promise<SessionData | null>;

  /**
   * Updates a session with new data
   * @param sessionId The session ID
   * @param data The data to update
   * @returns True if successful, false if session not found
   */
  updateSession(sessionId: string, data: Partial<SessionData>): Promise<boolean>;

  /**
   * Deletes a session
   * @param sessionId The session ID
   */
  deleteSession(sessionId: string): Promise<boolean>;

   /**
   * Creates a blank cookie for logout purposes
   */
   createBlankCookie(): Cookie;

  /**
   * Gets the current session ID from storage
   * @returns The current session ID or null if not found
   */
  getCurrentSessionId(): string | null;
}