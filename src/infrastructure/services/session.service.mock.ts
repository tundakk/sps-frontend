import { injectable } from "inversify";
import { ISessionService, SessionData } from "@/src/application/ports/session.service.port";
import { Cookie } from "@/src/core/dtos/cookie.dto";
import { SESSION_COOKIE } from "@/config";

@injectable()
export class MockSessionService implements ISessionService {
  private sessions: Map<string, SessionData> = new Map();
  private currentSessionId: string | null = null;
  
  async createSession(
    userId: string, 
    data?: Partial<Omit<SessionData, 'userId'>>
  ): Promise<string> {
    // Generate a unique session ID
    const sessionId = crypto.randomUUID();
    
    // Set expiration to 24 hours from now if not provided
    const expiresAt = data?.expiresAt || new Date();
    if (!data?.expiresAt) {
      expiresAt.setHours(expiresAt.getHours() + 24);
    }
    
    // Store the session with provided data
    const sessionData: SessionData = {
      userId,
      expiresAt,
      ...data
    };
    
    this.sessions.set(sessionId, sessionData);
    this.currentSessionId = sessionId; // Store as current session
    return sessionId;
  }
  
  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check if session has expired
    if (session.expiresAt < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }
    
    return session;
  }

  async updateSession(sessionId: string, data: Partial<SessionData>): Promise<boolean> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return false;
    }
    
    // Update the session with new data
    this.sessions.set(sessionId, { ...session, ...data });
    return true;
  }
  
  async deleteSession(sessionId: string): Promise<boolean> {
    // Check if session exists before deleting
    const exists = this.sessions.has(sessionId);
    this.sessions.delete(sessionId);
    
    // Clear current session ID if it matches
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
    
    return exists;
  }
  
  createBlankCookie(): Cookie {
    this.currentSessionId = null; // Clear current session on logout
    return {
      name: SESSION_COOKIE,
      value: "",
      attributes: {
        expires: new Date(0), // Set to epoch time to expire immediately
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }
    };
  }
  
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}