import 'reflect-metadata'; // Add this at the top
import { injectable, inject } from "inversify";
import axios from "axios";
import https from 'https';

import { IAuthenticationService } from "@/src/application/ports/authentication.service.port";
import type { ISessionService } from "@/src/application/ports/session.service.port";
import { UnauthenticatedError } from "@/src/core/errors/authentication.error";
import { Cookie } from "@/src/core/dtos/cookie.dto";
import { SESSION_COOKIE } from "@/config";
import { DI_SYMBOLS } from "@/src/di/types";
import { AuthResponseDto } from "@/src/core/dtos/auth/auth-response.dto";
import { UserDto } from "@/src/core/dtos/user/user.dto";
import logger from "../logging/logger";
import { ServiceResponse } from "@/src/core/domain/service-response.model"; // Import the existing type
const  ENV = process.env;

console.log('ENV', ENV.NODE_ENV);


@injectable()
export class AuthenticationService implements IAuthenticationService {
  private apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://your-api-domain.com";
  
  constructor(
    @inject(DI_SYMBOLS.ISessionService) private sessionService: ISessionService
  ) {}

  async signIn(username: string, password: string): Promise<{ 
    cookie: Cookie;
    tokens: { accessToken: string; refreshToken: string | null }
  }> {
    try {
      // Map username to email as expected by backend
      console.log(`Attempting to sign in with username: ${username} to ${this.apiBaseUrl}/api/Auth/login`);
      
      // Configure axios with timeout, proper headers, and disable certificate verification for development
      const httpsAgent = process.env.NODE_ENV === 'development' ? new https.Agent({ rejectUnauthorized: false }) : undefined;

      const response = await axios.post<ServiceResponse<AuthResponseDto>>(
        `${this.apiBaseUrl}/api/Auth/login`, 
        {
          email: username, // Backend expects email field
          password
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          httpsAgent
        }
      );

      // Log success response
      logger.info('Sign-in successful', { userId: response.data.data?.userId });

      // Check if the response indicates success
      if (!response.data.success || !response.data.data) {
        throw new UnauthenticatedError(response.data.message || "Login failed");
      }

      const authResponse = response.data.data;
      const { token, expiresIn, userId } = authResponse;
      
      // Create session with token included for persistence
      const sessionId = await this.sessionService.createSession(userId, { 
        token,
        tokenExpires: new Date(Date.now() + (expiresIn * 1000)).toISOString() 
      });
      
      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
      
      // Create cookie object
      const cookie: Cookie = {
        name: SESSION_COOKIE,
        value: sessionId,
        attributes: {
          expires: expirationDate,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'strict'
        }
      };

      return { 
        cookie,
        tokens: {
          accessToken: token,
          refreshToken: null // The API doesn't return a refresh token
        }
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Network or HTTP error
        if (error.code === 'ECONNRESET') {
          logger.error('Connection reset error during sign-in', {
            message: 'The connection to the API was reset. This might indicate the server closed the connection or a network issue.',
            code: error.code,
            url: `${this.apiBaseUrl}/api/Auth/login`,
          });
          throw new UnauthenticatedError('Unable to connect to authentication service. Please try again later.');
        } else if (error.code === 'ECONNREFUSED') {
          logger.error('Connection refused error during sign-in', {
            message: 'Could not connect to the API. The server might be down or the URL incorrect.',
            code: error.code,
            url: `${this.apiBaseUrl}/api/Auth/login`,
          });
          throw new UnauthenticatedError('Authentication service unavailable. Please try again later.');
        } else {
          // Other axios errors
          logger.error('Axios error during sign-in', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: `${this.apiBaseUrl}/api/Auth/login`,
            data: error.response?.data
          });
          throw new UnauthenticatedError('Sign-in failed. Please check your credentials or try again later.');
        }
      } else {
        // Non-axios errors
        logger.error('Error during sign-in', error);
        throw new UnauthenticatedError('An unexpected error occurred during sign-in.');
      }
    }
  }

  private isTokenExpired(tokenExpires: string): boolean {
    const expirationDate = new Date(tokenExpires);
    const now = new Date();
    return now >= expirationDate;
  }

  async refreshToken(sessionId: string): Promise<{
    cookie: Cookie;
    tokens: { accessToken: string; refreshToken: string | null }
  }> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      
      if (!session || !session.token) {
        throw new UnauthenticatedError("Session not found or expired");
      }

      // Get token from session
      const { token } = session;
      
      // Call the refresh token endpoint
      const response = await axios.post<ServiceResponse<AuthResponseDto>>(
        `${this.apiBaseUrl}/api/Auth/refresh-token`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          httpsAgent: process.env.NODE_ENV === 'development' ? 
            new https.Agent({ rejectUnauthorized: false }) : undefined
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new UnauthenticatedError(response.data.message || "Token refresh failed");
      }

      const authResponse = response.data.data;
      const { token: newToken, expiresIn } = authResponse;
      
      // Update session with new token AND expiration
      await this.sessionService.updateSession(sessionId, { 
        token: newToken,
        tokenExpires: new Date(Date.now() + (expiresIn * 1000)).toISOString() 
      });
      
      // Calculate new expiration date
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
      
      // Create updated cookie object
      const cookie: Cookie = {
        name: SESSION_COOKIE,
        value: sessionId,
        attributes: {
          expires: expirationDate,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'strict'
        }
      };

      return {
        cookie,
        tokens: {
          accessToken: newToken,
          refreshToken: null
        }
      };
    } catch (error) {
      logger.error('Error refreshing token', error);
      throw new UnauthenticatedError('Failed to refresh authentication token');
    }
  }

  async signOut(sessionId: string): Promise<{ blankCookie: Cookie }> {
    try {
      // Delete the session
      await this.sessionService.deleteSession(sessionId);
      
      // Return a blank cookie to clear the session
      const blankCookie: Cookie = {
        name: SESSION_COOKIE,
        value: "",
        attributes: {
          expires: new Date(0),
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'strict'
        }
      };
      
      return { blankCookie };
    } catch (error) {
      logger.error('Error during sign-out', error);
      // Even if there's an error, return a blank cookie to ensure the client session is cleared
      return {
        blankCookie: {
          name: SESSION_COOKIE,
          value: "",
          attributes: {
            expires: new Date(0),
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'strict'
          }
        }
      };
    }
  }

  async register(email: string, password: string, confirmPassword: string): Promise<{ 
    cookie: Cookie;
    user: UserDto;
  }> {
    try {
      const response = await axios.post<ServiceResponse<AuthResponseDto>>(`${this.apiBaseUrl}/api/Auth/register`, {
        email,
        password,
        confirmPassword
      });

      if (!response.data.success || !response.data.data) {
        const errorMessage = response.data.message || "Registration failed";
        const errorCode = response.data.errorCode || "REGISTRATION_FAILED";
        
        throw new Error(`${errorMessage} (${errorCode})`);
      }

      const authResponse = response.data.data;
      const { token, expiresIn, userId, email: userEmail, userName, roles } = authResponse;
      
      // Create session with token included for persistence
      const sessionId = await this.sessionService.createSession(userId, { 
        token,
        tokenExpires: new Date(Date.now() + (expiresIn * 1000)).toISOString() 
      });
      
      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
      
      // Create cookie object
      const cookie: Cookie = {
        name: SESSION_COOKIE,
        value: sessionId,
        attributes: {
          expires: expirationDate,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'strict'
        }
      };

      return { 
        cookie,
        user: {
          id: userId,
          email: userEmail,
          userName,
          roles
        }
      };
    } catch (error) {
      logger.error('Error during registration', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  async validateSession(sessionId: string): Promise<{ session: { userId: string } }> {
    const session = await this.sessionService.getSession(sessionId);
    
    if (!session) {
      throw new UnauthenticatedError("Session not found or expired");
    }
    
    return { session: { userId: session.userId } };
  }

  async getCurrentUser(sessionId: string): Promise<UserDto> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      
      if (!session) {
        throw new UnauthenticatedError("Session not found or expired");
      }

      // Check if token has expired
      if (session.tokenExpires && this.isTokenExpired(session.tokenExpires)) {
        // Attempt to refresh the token
        await this.refreshToken(sessionId);
        // Get the updated session
        const updatedSession = await this.sessionService.getSession(sessionId);
        if (!updatedSession || !updatedSession.token) {
          throw new UnauthenticatedError("Session token expired");
        }
        
        // Use the new token for the API call
        const response = await axios.get<ServiceResponse<UserDto>>(
          `${this.apiBaseUrl}/api/Auth/me`,
          {
            headers: {
              Authorization: `Bearer ${updatedSession.token}`
            }
          }
        );
        if (!response.data.success || !response.data.data) {
          throw new UnauthenticatedError(response.data.message || "Failed to get user information");
        }

        return response.data.data;
      }

      // Get token from session
      const { token } = session;
      
      if (!token) {
        throw new UnauthenticatedError("No authentication token found");
      }

      // Make authenticated request to get current user
      const response = await axios.get<ServiceResponse<UserDto>>(
        `${this.apiBaseUrl}/api/Auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new UnauthenticatedError(response.data.message || "Failed to get user information");
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error getting current user', error);
      throw new UnauthenticatedError('Unable to fetch user information');
    }
  }

  // Add this method to your AuthenticationService class
  async checkApiHealth(): Promise<boolean> {
    try {
      const httpsAgent = process.env.NODE_ENV === 'development' ? new https.Agent({ rejectUnauthorized: false }) : undefined;
      const response = await axios.get(`${this.apiBaseUrl}/api/health`, {
        timeout: 5000,
        httpsAgent
      });
      return response.status === 200;
    } catch (error) {
      logger.error('API health check failed', error);
      return false;
    }
  }
}