/**
 * SupplySense — Common API Response Type Definitions
 * Maps to backend: backend/app/schemas/common.py
 */

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  request_id?: string;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginationResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
  request_id?: string;
  timestamp?: string;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetail;
  request_id?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, code: string = "UNKNOWN_ERROR", details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
