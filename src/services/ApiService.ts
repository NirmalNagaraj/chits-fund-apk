import { ApiResponse } from '../types';
import { config } from '../config/config';

export class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return this.handleErrorResponse(response.status, data);
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        if (attempt < this.retryAttempts) {
          console.log(`Request timeout, retrying... (${attempt}/${this.retryAttempts})`);
          return this.makeRequest(endpoint, options, attempt + 1);
        }
        return {
          success: false,
          error: 'Request timeout',
          message: 'The request took too long to complete. Please try again.',
        };
      }

      if (attempt < this.retryAttempts) {
        console.log(`Network error, retrying... (${attempt}/${this.retryAttempts})`);
        return this.makeRequest(endpoint, options, attempt + 1);
      }

      return {
        success: false,
        error: 'Network error',
        message: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  }

  private handleErrorResponse<T>(status: number, data: any): ApiResponse<T> {
    switch (status) {
      case 400:
        return {
          success: false,
          error: data.error || 'Validation failed',
          message: data.message || 'Invalid input data provided.',
        };
      case 404:
        return {
          success: false,
          error: data.error || 'Not found',
          message: data.message || 'The requested resource was not found.',
        };
      case 409:
        return {
          success: false,
          error: data.error || 'Conflict',
          message: data.message || 'A conflict occurred with the current state.',
        };
      case 500:
        return {
          success: false,
          error: data.error || 'Internal server error',
          message: data.message || 'An internal server error occurred. Please try again later.',
        };
      default:
        return {
          success: false,
          error: 'Unknown error',
          message: 'An unexpected error occurred. Please try again.',
        };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiService = new ApiService();