import { injectable, inject } from 'inversify';
import { ISessionService } from "@/src/application/ports/session.service.port";
import type { ICookieStorageService } from '@/src/application/ports/cookie-storage.port';
import { Cookie } from "@/src/core/dtos/cookie.dto";
import { SESSION_COOKIE } from "@/config";
import { DI_SYMBOLS } from "@/src/di/types";

type SessionMetadata = {
  token?: string;
  [key: string]: unknown;
};

@injectable()
export class SessionService implements ISessionService {
  constructor(
    @inject(DI_SYMBOLS.ICookieStorageService) private cookieStorageService: ICookieStorageService
  ) {}

  private sessions: Map<string, { userId: string; expiresAt: Date; metadata?: SessionMetadata }> = new Map();
  
  async createSession(userId: string, metadata?: Record<string, unknown>): Promise<string> {
    const sessionId = `session_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    this.sessions.set(sessionId, { userId, expiresAt, metadata });
    return sessionId;
  }
  
  async getSession(sessionId: string): Promise<{ userId: string; expiresAt: Date; token?: string; [key: string]: unknown } | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    if (session.expiresAt < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }
    return {
      userId: session.userId,
      expiresAt: session.expiresAt,
      ...(session.metadata || {})
    };
  }
  
  async updateSession(sessionId: string, metadata: Record<string, unknown>): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return false;
      }
      if (session.expiresAt < new Date()) {
        await this.deleteSession(sessionId);
        return false;
      }
      const updatedMetadata = {
        ...(session.metadata || {}),
        ...metadata
      };
      this.sessions.set(sessionId, {
        userId: session.userId,
        expiresAt: session.expiresAt,
        metadata: updatedMetadata
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      this.sessions.delete(sessionId);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  createBlankCookie(): Cookie {
    return {
      name: SESSION_COOKIE,
      value: "",
      attributes: {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }
    };
  }

  getCurrentSessionId(): string | null {
    return this.cookieStorageService.getCookie(SESSION_COOKIE);
  }
}