import { ServiceResponse } from "@/src/core/domain/service-response.model";
import { AxiosRequestConfig } from 'axios';

export type ApiRequestData = Record<string, unknown>;
export type ApiOptions = Partial<AxiosRequestConfig>;

export interface IApiClientService {
  get<T>(endpoint: string, options?: ApiOptions): Promise<ServiceResponse<T>>;
  post<T>(endpoint: string, data?: ApiRequestData, options?: ApiOptions): Promise<ServiceResponse<T>>;
  put<T>(endpoint: string, data?: ApiRequestData, options?: ApiOptions): Promise<ServiceResponse<T>>;
  delete<T>(endpoint: string, options?: ApiOptions): Promise<ServiceResponse<T>>;
  unauthenticatedRequest<T>(method: string, endpoint: string, data?: ApiRequestData, config?: AxiosRequestConfig): Promise<ServiceResponse<T>>;
}