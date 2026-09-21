/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * NORMALIZED API INTERFACES & DTO CONTRACTS
 * 
 * Architectural Purpose:
 * Prepares the frontend for Spring Boot REST API integration.
 * Matches Spring Data Pageable responses and standard Spring RFC 7807 Problem Detail errors.
 * 
 * Future Spring Boot Model Mapping:
 * - org.springframework.data.domain.Page<T> -> PaginatedResponse<T>
 * - org.springframework.http.ProblemDetail -> ApiErrorResponse
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  path: string;
  validationErrors?: Record<string, string[]> | null;
  correlationId?: string;
}
