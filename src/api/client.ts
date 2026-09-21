/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CENTRALIZED API CLIENT INFRASTRUCTURE
 * 
 * Architectural Purpose:
 * Provides unified request execution, correlation ID propagation (X-Correlation-ID),
 * JWT bearer injection, error transformation, and mock API pass-through.
 * Components NEVER invoke fetch() or axios directly.
 * 
 * Spring Boot Integration Notes:
 * - Automatically attaches Authorization: Bearer <token>
 * - Attaches X-Correlation-ID for distributed tracing (Micrometer / OpenTelemetry)
 */

import { APP_CONFIG } from '../app/config';
import { ApiErrorResponse } from './types';

export class ApiError extends Error {
  public code: string;
  public status: number;
  public validationErrors?: Record<string, string[]> | null;
  public correlationId?: string;

  constructor(message: string, status: number, code: string, validationErrors?: Record<string, string[]> | null, correlationId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.validationErrors = validationErrors;
    this.correlationId = correlationId;
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public setToken(token: string | null): void {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  private generateCorrelationId(): string {
    return `civic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const correlationId = this.generateCorrelationId();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Correlation-ID': correlationId,
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: Partial<ApiErrorResponse> = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: response.statusText || 'An unexpected server error occurred',
          };
        }

        throw new ApiError(
          errorData.message || 'Civic API Error',
          response.status,
          errorData.code || `HTTP_${response.status}`,
          errorData.validationErrors,
          errorData.correlationId || correlationId
        );
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        (err as Error).message || 'Network communication failed with Civic Services',
        0,
        'NETWORK_FAILURE',
        null,
        correlationId
      );
    }
  }

  public get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(APP_CONFIG.apiBaseUrl);
