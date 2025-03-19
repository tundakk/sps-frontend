import { injectable, inject } from 'inversify';
import { ISessionService, SessionData } from "@/src/application/ports/session.service.port";
import type { ICookieStorageService } from '@/src/application/ports/cookie-storage.port';
import { Cookie } from "@/src/core/dtos/cookie.dto";
import { SESSION_COOKIE } from "@/config";
import { DI_SYMBOLS } from "@/src/di/types";
import Database from 'better-sqlite3';
import logger from '../logging/logger';
import path from 'path';
import fs from 'fs';

interface DbSession {
  id: string;
  userId: string;
  expiresAt: string;
  metadata: string | null;
}

/**
 * SQLite implementation of session service
 * Provides persistent storage of session data across server restarts
 */
@injectable()
export class SqliteSessionService implements ISessionService {
  // Use definite assignment assertion to tell TypeScript these will be initialized
  private db!: Database.Database;
  private dbInitialized: boolean = false;
  
  // Prepared statements for better performance
  private insertStmt!: Database.Statement;
  private selectStmt!: Database.Statement;
  private updateStmt!: Database.Statement;
  private deleteStmt!: Database.Statement;
  private cleanupStmt!: Database.Statement;
  
  constructor(
    @inject(DI_SYMBOLS.ICookieStorageService) private cookieStorageService: ICookieStorageService
  ) {
    this.initializeDatabase();
  }
  
  /**
   * Initializes the SQLite database and prepares statements
   */
  private initializeDatabase(): void {
    try {
      // Ensure directory exists
      const dbDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const dbPath = path.join(dbDir, 'sessions.db');
      this.db = new Database(dbPath);
      
      // Enable WAL journal mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      
      // Create sessions table if it doesn't exist
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          expiresAt TEXT NOT NULL,
          metadata TEXT
        )
      `);
      
      // Create indexes for faster lookups
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expiresAt);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(userId);
      `);
      
      // Prepare statements for better performance
      this.insertStmt = this.db.prepare('INSERT INTO sessions (id, userId, expiresAt, metadata) VALUES (?, ?, ?, ?)');
      this.selectStmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?');
      this.updateStmt = this.db.prepare('UPDATE sessions SET metadata = ? WHERE id = ?');
      this.deleteStmt = this.db.prepare('DELETE FROM sessions WHERE id = ?');
      this.cleanupStmt = this.db.prepare('DELETE FROM sessions WHERE expiresAt < ?');
      
      this.dbInitialized = true;
      
      // Setup periodic cleanup
      this.scheduleCleanup();
      
      logger.info('SQLite session database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize session database', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new Error('Failed to initialize session database');
    }
  }
  
  /**
   * Creates a new session for a user
   */
  async createSession(userId: string, data?: Partial<Omit<SessionData, 'userId'>>): Promise<string> {
    if (!this.dbInitialized) {
      await this.initializeDatabase();
    }
    
    const sessionId = `session_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    try {
      // Store metadata as JSON string
      this.insertStmt.run(
        sessionId, 
        userId, 
        expiresAt.toISOString(), 
        data ? JSON.stringify(data) : null
      );
      
      logger.debug('Created new session', { userId, sessionId });
      return sessionId;
    } catch (error) {
      logger.error('Failed to create session', { 
        userId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new Error('Failed to create session');
    }
  }
  
  /**
   * Gets session data by ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    if (!this.dbInitialized) {
      await this.initializeDatabase();
    }
    
    try {
      // Type cast the result to our interface for type safety
      const session = this.selectStmt.get(sessionId) as DbSession | undefined;
      
      if (!session) {
        logger.debug('Session not found', { sessionId });
        return null;
      }
      
      // Check if session has expired
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        logger.debug('Session expired', { sessionId });
        await this.deleteSession(sessionId);
        return null;
      }
      
      // Parse metadata if it exists
      const metadata = session.metadata ? JSON.parse(session.metadata) : {};
      
      // Create and return session data object
      return {
        userId: session.userId,
        expiresAt,
        ...metadata
      };
    } catch (error) {
      logger.error('Failed to get session', { 
        sessionId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }
  
  /**
   * Updates a session with new metadata
   */
  async updateSession(sessionId: string, data: Partial<SessionData>): Promise<boolean> {
    if (!this.dbInitialized) {
      await this.initializeDatabase();
    }
    
    try {
      // First get the current session to merge metadata
      const session = await this.getSession(sessionId);
      if (!session) {
        logger.debug('Cannot update non-existent session', { sessionId });
        return false;
      }
      
      // Create a copy of the session object for metadata extraction
      const sessionCopy = { ...session };
      
      // Extract base properties that should not be stored in metadata
      // Use destructuring with rest pattern to separate core properties from metadata
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, expiresAt, ...metadataFromSession } = sessionCopy;
      
      // Merge with new data, but don't override userId and expiresAt
      const metadataFromNewData = { ...data };
      delete metadataFromNewData.userId;
      delete metadataFromNewData.expiresAt;
      
      const updatedMetadata = {
        ...metadataFromSession,
        ...metadataFromNewData
      };
      
      // Update the session in the database
      const result = this.updateStmt.run(JSON.stringify(updatedMetadata), sessionId);
      
      const success = result.changes > 0;
      if (success) {
        logger.debug('Updated session', { sessionId });
      } else {
        logger.warn('Session update had no effect', { sessionId });
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to update session', { 
        sessionId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }
  
  /**
   * Deletes a session by ID
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    if (!this.dbInitialized) {
      await this.initializeDatabase();
    }
    
    try {
      const result = this.deleteStmt.run(sessionId);
      
      const success = result.changes > 0;
      if (success) {
        logger.debug('Deleted session', { sessionId });
      } else {
        logger.debug('No session to delete', { sessionId });
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to delete session', { 
        sessionId,
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }
  
  /**
   * Creates a blank cookie for logging out
   */
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

  /**
   * Gets the current session ID from cookies
   */
  getCurrentSessionId(): string | null {
    return this.cookieStorageService.getCookie(SESSION_COOKIE);
  }
  
  /**
   * Sets up periodic cleanup of expired sessions
   */
  private scheduleCleanup(): void {
    const cleanupInterval = 15 * 60 * 1000; // 15 minutes
    
    const cleanup = () => {
      try {
        const now = new Date().toISOString();
        const result = this.cleanupStmt.run(now);
        
        if (result.changes > 0) {
          logger.info(`Cleaned up ${result.changes} expired sessions`);
        }
      } catch (error) {
        logger.error('Failed to clean up expired sessions', { 
          error: error instanceof Error ? error.message : String(error) 
        });
      } finally {
        // Always schedule the next cleanup
        setTimeout(cleanup, cleanupInterval);
      }
    };
    
    // Run first cleanup after a short delay
    setTimeout(cleanup, 60 * 1000);
  }
}
