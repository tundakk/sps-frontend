import 'reflect-metadata';
import { injectable } from 'inversify';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import https from 'https';

import { UnauthenticatedError } from '@/src/core/errors/authentication.error';
import logger from '../logging/logger';
import { ApiRequestData, ApiOptions, IApiClientService } from '@/src/application/ports/api-client.port';
import { ServiceResponse } from "@/src/core/domain/service-response.model"; 

/**
 * Default API client service implementation
 */
@injectable()
export class ApiClientService implements IApiClientService {
  private apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:44329";
  private httpsAgent = process.env.NODE_ENV === 'development' ? 
    new https.Agent({ rejectUnauthorized: false }) : undefined;

  /**
   * Makes a GET request to the API
   */
  async get<T>(endpoint: string, options?: ApiOptions): Promise<ServiceResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Makes a POST request to the API
   */
  async post<T>(endpoint: string, data?: ApiRequestData, options?: ApiOptions): Promise<ServiceResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Makes a PUT request to the API
   */
  async put<T>(endpoint: string, data?: ApiRequestData, options?: ApiOptions): Promise<ServiceResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Makes a DELETE request to the API
   */
  async delete<T>(endpoint: string, options?: ApiOptions): Promise<ServiceResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Makes an unauthenticated request to the API (for login/register endpoints)
   */
  async unauthenticatedRequest<T>(
    method: string, 
    endpoint: string, 
    data?: ApiRequestData, 
    config?: AxiosRequestConfig
  ): Promise<ServiceResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method,
        url: `${this.apiBaseUrl}${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          ...(config?.headers || {})
        },
        timeout: config?.timeout || 10000,
        httpsAgent: this.httpsAgent,
        ...config
      };
      
      const response = await axios.request<ServiceResponse<T>>(requestConfig);
      return this.handleResponse<T>(response.data, endpoint);
    } catch (error) {
      return this.handleRequestError<T>(error as Error | AxiosError, endpoint);
    }
  }

  /**
   * Makes a request to the API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: ApiRequestData,
    options?: ApiOptions
  ): Promise<ServiceResponse<T>> {
    try {
      const { headers, timeout, ...restOptions } = options || {};
      const requestConfig: AxiosRequestConfig = {
        method,
        url: `${this.apiBaseUrl}${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          ...(headers || {})
        },
        timeout: typeof timeout === 'number' ? timeout : 10000,
        httpsAgent: this.httpsAgent,
        ...restOptions
      };
      
      const response = await axios.request<ServiceResponse<T>>(requestConfig);
      return this.handleResponse<T>(response.data, endpoint);
    } catch (error) {
      return this.handleRequestError<T>(error as Error | AxiosError, endpoint);
    }
  }

  /**
   * Processes the response from the API
   */
  private handleResponse<T>(responseData: ServiceResponse<T>, endpoint: string): ServiceResponse<T> {
    if (!responseData.success) {
      switch (responseData.errorCode) {
        case 'UNAUTHORIZED':
          logger.error('Unauthorized API request', {
            endpoint,
            message: responseData.message
          });
          throw new UnauthenticatedError(responseData.message || 'Authentication required');
          
        case 'VALIDATION_ERROR':
          logger.error('Validation error in API request', {
            endpoint,
            validationErrors: responseData.validationErrors
          });
          
          const validationMessage = responseData.validationErrors 
            ? Object.entries(responseData.validationErrors)
                .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                .join('; ')
            : responseData.message;
            
          throw new Error(`Validation failed: ${validationMessage}`);
          
        default:
          logger.error('API request failed', {
            endpoint,
            errorCode: responseData.errorCode,
            message: responseData.message
          });
          throw new Error(responseData.message || 'API request failed');
      }
    }
    
    if (responseData.data === null) {
      logger.warn('API returned success but null data', { endpoint });
    }
    
    return responseData;
  }

  /**
   * Handles errors from API requests
   */
  private handleRequestError<T>(error: Error | AxiosError, endpoint: string): never {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        logger.error('Authentication failed during API request', {
          endpoint,
          status: error.response.status
        });
        throw new UnauthenticatedError('Authentication required');
      }
      
      if (error.response?.data) {
        const responseData = error.response.data as ServiceResponse<T>;
        if (responseData.message) {
          logger.error('API error response', {
            endpoint,
            status: error.response.status,
            errorCode: responseData.errorCode,
            message: responseData.message
          });
          throw new Error(responseData.message);
        }
      }
      
      if (error.code === 'ECONNREFUSED') {
        logger.error('Connection refused', {
          endpoint,
          code: error.code
        });
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      
      logger.error('API request failed', {
        endpoint,
        status: error.response?.status,
        message: error.message
      });
      throw new Error(`Request failed: ${error.message}`);
    }
    
    logger.error('Non-Axios error during API request', {
      endpoint,
      error: error.message
    });
    
    throw error;
  }
}
