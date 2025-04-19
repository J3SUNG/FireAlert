/**
 * 통합된 에러 타입 정의
 */

export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  NETWORK = "network",
  API = "api",
  VALIDATION = "validation",
  UI = "ui",
  DATA = "data",
  MAP = "map",
  GENERAL = "general",
}

export enum ErrorType {
  UNKNOWN = "unknown",
  NETWORK = "network",
  AUTH = "auth",
  VALIDATION = "validation",
  NOT_FOUND = "not_found",

  MAP_LOAD_FAILED = "map_load_failed",
  FIRE_DATA_FETCH_FAILED = "fire_data_fetch_failed",
  GEOLOCATION_UNAVAILABLE = "geolocation_unavailable",
  PERMISSION_DENIED = "permission_denied",
}

export interface ErrorContext {
  component?: string;
  feature?: string;
  functionName?: string;
  params?: Record<string, any>;
  timestamp?: number;
  action?: string;
  silent?: boolean;
}

export interface ErrorOptions {
  showUser?: boolean;
  retryable?: boolean;
  toast?: boolean;
  log?: boolean;
  metadata?: Record<string, any>;
}

export interface AppError {
  message: string;
  type: ErrorType;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code?: string;
  timestamp: number;
  context?: ErrorContext;
  originalError?: unknown;
  options?: ErrorOptions;
}

export type ErrorHandler = (error: AppError) => void;

export interface ErrorLoggingOptions {
  logToConsole?: boolean;
  logToService?: boolean;
}

export interface ErrorHandlingService {
  handleError(error: AppError | Error | unknown, context?: ErrorContext): void;
  registerHandler(handler: ErrorHandler): void;
  unregisterHandler(handler: ErrorHandler): void;
  createError(
    message: string,
    type: ErrorType,
    options?: Partial<Omit<AppError, "message" | "type" | "timestamp">>
  ): AppError;
  getUserMessage(error: AppError): string;
}
