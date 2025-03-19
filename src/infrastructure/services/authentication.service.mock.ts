import { injectable } from "inversify";
import { IAuthenticationService } from "@/src/application/ports/authentication.service.port";
import { UnauthenticatedError } from "@/src/core/errors/authentication.error";
import { Cookie } from "@/src/core/dtos/cookie.dto";
import { SESSION_COOKIE } from "@/config";

// Define User type for the mock service
interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  roles?: string[];
}

// Mock user data for testing
const mockUsers: User[] = [
  {
    id: "user1",
    username: "testuser",
    email: "testuser@example.com",
    password_hash: "password123",
    roles: ["User"]
  },
  {
    id: "115b5117-73f6-4796-a87a-962181baa3e5",
    username: "user1@example.com",
    email: "user1@example.com",
    password_hash: "Password123!",
    roles: ["User", "Admin"]
  },
];

@injectable()
export class MockAuthenticationService implements IAuthenticationService {
  private _token: string | null = null;
  private _refreshToken: string | null = null;
  private _expiration: Date | null = null;
  private _currentUser: User | null = null;

  /**
   * Signs in a user with provided credentials
   */
  async signIn(username: string, password: string): Promise<{ 
    cookie: Cookie;
    tokens: { 
      accessToken: string; 
      refreshToken: string | null;
    }
  }> {
    await this._simulateDelay(300);

    // Find user by username or email
    const user = mockUsers.find(
      u => u.username === username || u.email === username
    );
    
    if (!user || user.password_hash !== password) {
      throw new UnauthenticatedError("Invalid username or password");
    }

    this._currentUser = user;
    this._generateTokens();

    // Create session cookie that expires in 24 hours
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);
    
    const cookie: Cookie = {
      name: SESSION_COOKIE,
      value: `mock_session_${user.id}`,
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
        accessToken: this._token!,
        refreshToken: this._refreshToken
      }
    };
  }

  /**
   * Refreshes an authentication token
   */
  async refreshToken(sessionId: string): Promise<{
    cookie: Cookie;
    tokens: { 
      accessToken: string; 
      refreshToken: string | null 
    }
  }> {
    await this._simulateDelay(200);
    
    if (!sessionId || !sessionId.startsWith('mock_session_')) {
      throw new UnauthenticatedError("Invalid session");
    }
    
    const userId = sessionId.replace('mock_session_', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new UnauthenticatedError("Session not found");
    }
    
    // Set the current user and generate new tokens
    this._currentUser = user;
    this._generateTokens();
    
    // Create session cookie that expires in 24 hours
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);
    
    const cookie: Cookie = {
      name: SESSION_COOKIE,
      value: sessionId, // Keep the same session ID
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
        accessToken: this._token!,
        refreshToken: this._refreshToken
      }
    };
  }

  /**
   * Signs out a user by invalidating their session
   */
  async signOut(sessionId: string): Promise<{ blankCookie: Cookie }> {
    await this._simulateDelay(100);
    
    // Validate the session ID format
    if (sessionId && sessionId.startsWith('mock_session_')) {
      const userId = sessionId.replace('mock_session_', '');
      const user = mockUsers.find(u => u.id === userId);
      
      if (user) {
        // Only clear session if it matches a valid user
        this._clearSession();
      } else {
        console.log(`No user found for session: ${sessionId}`);
      }
    } else {
      console.log(`Invalid session format: ${sessionId}`);
    }
    
    const blankCookie: Cookie = {
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

    return { blankCookie };
  }

  /**
   * Validates a session and returns user information
   */
  async validateSession(sessionId: string): Promise<{ session: { userId: string } }> {
    await this._simulateDelay(50);
    
    if (!sessionId || !sessionId.startsWith('mock_session_')) {
      throw new UnauthenticatedError("Invalid session");
    }
    
    const userId = sessionId.replace('mock_session_', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new UnauthenticatedError("Session not found");
    }
    
    return { session: { userId: user.id } };
  }

  /**
   * Gets the current authenticated user
   */
  async getCurrentUser(id: string): Promise<{ 
    id: string; 
    email: string; 
    userName: string; 
    roles: string[] 
  }> {
    await this._simulateDelay(50);
    
    if (!id || !id.startsWith('mock_session_')) {
      throw new UnauthenticatedError("Invalid session");
    }
    
    const userId = id.replace('mock_session_', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new UnauthenticatedError("User not found");
    }
    
    return {
      id: user.id,
      email: user.email,
      userName: user.username,
      roles: user.roles || ["User"]
    };
  }

  /**
   * Generates tokens for authenticated session
   */
  private _generateTokens(): void {
    if (!this._currentUser) {
      throw new Error("Cannot generate tokens without a current user");
    }
    
    // Set expiration to 3 hours from now
    this._expiration = new Date();
    this._expiration.setHours(this._expiration.getHours() + 3);
    
    // Generate tokens
    this._token = this._generateMockJwt();
    this._refreshToken = this._generateMockRefreshToken();
  }

  /**
   * Clears the current session
   */
  private _clearSession(): void {
    this._token = null;
    this._refreshToken = null;
    this._expiration = null;
    this._currentUser = null;
  }

  /**
   * Generates a mock JWT token
   */
  private _generateMockJwt(): string {
    const header = this._base64Encode(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    }));
    
    const payload = this._base64Encode(JSON.stringify({
      sub: this._currentUser!.id,
      email: this._currentUser!.email,
      name: this._currentUser!.username,
      roles: this._currentUser!.roles || ["User"],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(this._expiration!.getTime() / 1000)
    }));
    
    return `${header}.${payload}.mock_signature`;
  }

  /**
   * Generates a mock refresh token
   */
  private _generateMockRefreshToken(): string {
    return `refresh_${this._currentUser!.id}_${Date.now()}`;
  }

  /**
   * Base64 encodes a string (URL-safe)
   */
  private _base64Encode(str: string): string {
    if (typeof window !== 'undefined') {
      // Browser environment
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } else {
      // Node environment
      return Buffer.from(str).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  }

  /**
   * Simulates network latency for realistic testing
   */
  private _simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}