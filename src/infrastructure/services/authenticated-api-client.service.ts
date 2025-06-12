import { injectable, inject } from 'inversify';
import { DI_SYMBOLS } from '@/src/di/types';
import type { IApiClientService, ApiRequestData } from '@/src/application/ports/api-client.port';
import type { ISessionService, SessionData } from '@/src/application/ports/session.service.port';
import type { IAuthenticationService } from '@/src/application/ports/authentication.service.port';
import { UnauthenticatedError } from '@/src/core/errors/authentication.error';
import { ServiceResponse } from '@/src/core/domain/service-response.model';
import logger from '../logging/logger';

/**
 * Service that handles authenticated API communication with the backend
 * Uses the token from the session and handles automatic token refresh
 */
@injectable()
export class AuthenticatedApiClientService {
  constructor(
    @inject(DI_SYMBOLS.IApiClientService) private apiClient: IApiClientService,
    @inject(DI_SYMBOLS.ISessionService) private sessionService: ISessionService,
    @inject(DI_SYMBOLS.IAuthenticationService) private authenticationService: IAuthenticationService
  ) {}

  /**
   * Makes an authenticated GET request to the API
   * Preserves the ServiceResponse wrapper from the backend
   */
  async get<T>(endpoint: string): Promise<ServiceResponse<T>> {
    const session = await this.getActiveSession();
    if (!session.token) {
      throw new UnauthenticatedError('No authentication token available');
    }
    
    // Check if token needs refresh
    if (session.tokenExpires && this.isTokenExpired(new Date(session.tokenExpires))) {
      await this.refreshToken(session);
    }
    
    return this.apiClient.get<T>(endpoint, { 
      headers: { 'Authorization': `Bearer ${session.token}` } 
    });
  }

  /**
   * Makes an authenticated POST request to the API
   * Preserves the ServiceResponse wrapper from the backend
   */
  async post<T>(endpoint: string, data: ApiRequestData): Promise<ServiceResponse<T>> {
    const session = await this.getActiveSession();
    if (!session.token) {
      throw new UnauthenticatedError('No authentication token available');
    }
    
    // Check if token needs refresh
    if (session.tokenExpires && this.isTokenExpired(new Date(session.tokenExpires))) {
      await this.refreshToken(session);
    }
    
    return this.apiClient.post<T>(endpoint, data, { 
      headers: { 'Authorization': `Bearer ${session.token}` } 
    });
  }

  /**
   * Makes an authenticated PUT request to the API
   */
  async put<T>(endpoint: string, data: ApiRequestData): Promise<ServiceResponse<T>> {
    const session = await this.getActiveSession();
    if (!session.token) {
      throw new UnauthenticatedError('No authentication token available');
    }
    
    // Check if token needs refresh
    if (session.tokenExpires && this.isTokenExpired(new Date(session.tokenExpires))) {
      await this.refreshToken(session);
    }
    
    return this.apiClient.put<T>(endpoint, data, { 
      headers: { 'Authorization': `Bearer ${session.token}` } 
    });
  }

  /**
   * Makes an authenticated DELETE request to the API
   */
  async delete<T>(endpoint: string): Promise<ServiceResponse<T>> {
    const session = await this.getActiveSession();
    if (!session.token) {
      throw new UnauthenticatedError('No authentication token available');
    }
    
    // Check if token needs refresh
    if (session.tokenExpires && this.isTokenExpired(new Date(session.tokenExpires))) {
      await this.refreshToken(session);
    }
    
    return this.apiClient.delete<T>(endpoint, { 
      headers: { 'Authorization': `Bearer ${session.token}` } 
    });
  }
  /**
   * Gets the current active session with validation
   */
  private async getActiveSession(): Promise<SessionData> {
    const sessionId = await this.sessionService.getCurrentSessionId();
    if (!sessionId) {
      throw new UnauthenticatedError('No active session');
    }
    
    const session = await this.sessionService.getSession(sessionId);
    if (!session) {
      throw new UnauthenticatedError('No active session');
    }
    
    // Check if session has expired
    if (session.expiresAt < new Date()) {
      throw new UnauthenticatedError('Session has expired');
    }
    
    return session;
  }
    /**
   * Refreshes an authentication token
   */
  private async refreshToken(session: SessionData): Promise<void> {
    const sessionId = session.id || await this.sessionService.getCurrentSessionId();
    if (!sessionId) {
      throw new UnauthenticatedError('No active session');
    }
    
    try {
      logger.info('Refreshing authentication token');
      
      // Call the refresh token endpoint through the authentication service
      await this.authenticationService.refreshToken(sessionId);
      
      logger.info('Token refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh token', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new UnauthenticatedError('Your session has expired. Please sign in again.');
    }
  }
  
  /**
   * Checks if a token is expired with a buffer window
   */
  private isTokenExpired(expirationDate: Date): boolean {
    // Add a buffer to prevent edge cases (30 seconds before actual expiry)
    const bufferTime = 30 * 1000; // 30 seconds in milliseconds
    return new Date() >= new Date(expirationDate.getTime() - bufferTime);
  }
}
