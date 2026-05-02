// filepath: src/lib/errors.ts
/**
 * Centralized error handling for Subora
 * Eliminates magic strings and provides consistent error codes
 */

// Error codes for consistent client handling
export const ErrorCodes = {
  // Database errors
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_INSERT_FAILED: 'DB_INSERT_FAILED',
  DB_UPDATE_FAILED: 'DB_UPDATE_FAILED',
  DB_DELETE_FAILED: 'DB_DELETE_FAILED',

  // Auth errors
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_INVALID_SIGNATURE: 'AUTH_INVALID_SIGNATURE',
  AUTH_MISSING_HEADER: 'AUTH_MISSING_HEADER',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',

  // Validation errors
  VALIDATION_MISSING_FIELD: 'VALIDATION_MISSING_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',

  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_FORBIDDEN: 'RESOURCE_FORBIDDEN',

  // Payment errors
  PAYMENT_VERIFICATION_FAILED: 'PAYMENT_VERIFICATION_FAILED',
  PAYMENT_INSUFFICIENT_AMOUNT: 'PAYMENT_INSUFFICIENT_AMOUNT',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',
  PAYMENT_CONFIG_MISSING: 'PAYMENT_CONFIG_MISSING',

  // External service errors
  EXTERNAL_TELEGRAM_FAILED: 'EXTERNAL_TELEGRAM_FAILED',
  EXTERNAL_TONAPI_FAILED: 'EXTERNAL_TONAPI_FAILED',
  EXTERNAL_SUPABASE_FAILED: 'EXTERNAL_SUPABASE_FAILED',

  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// Custom error class for Subora
export class SuboraError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SuboraError';
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

// Factory functions for common errors
export const errors = {
  unauthorized: (message = 'Unauthorized') =>
    new SuboraError(ErrorCodes.AUTH_UNAUTHORIZED, message, 401),

  notFound: (resource: string) =>
    new SuboraError(ErrorCodes.RESOURCE_NOT_FOUND, `${resource} not found`, 404),

  forbidden: (message = 'Access denied') =>
    new SuboraError(ErrorCodes.RESOURCE_FORBIDDEN, message, 403),

  badRequest: (message: string) =>
    new SuboraError(ErrorCodes.BAD_REQUEST, message, 400),

  validation: (field: string, message?: string) =>
    new SuboraError(
      ErrorCodes.VALIDATION_MISSING_FIELD,
      message || `Missing required field: ${field}`,
      400
    ),

  dbConnection: (message = 'Database connection failed') =>
    new SuboraError(ErrorCodes.DB_CONNECTION_FAILED, message, 500),

  dbQuery: (message = 'Database query failed') =>
    new SuboraError(ErrorCodes.DB_QUERY_FAILED, message, 500),

  paymentFailed: (message = 'Payment verification failed') =>
    new SuboraError(ErrorCodes.PAYMENT_VERIFICATION_FAILED, message, 402),

  paymentConfigMissing: () =>
    new SuboraError(
      ErrorCodes.PAYMENT_CONFIG_MISSING,
      'Payment configuration missing. Set TONAPI_KEY environment variable.',
      500
    ),

  internal: (message = 'An internal error occurred') =>
    new SuboraError(ErrorCodes.INTERNAL_ERROR, message, 500),
};

// Helper to convert errors to NextResponse
export function handleError(error: unknown) {
  if (error instanceof SuboraError) {
    return {
      code: error.code,
      message: error.message,
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message,
      status: 500,
    };
  }

  return {
    code: ErrorCodes.INTERNAL_ERROR,
    message: 'An unknown error occurred',
    status: 500,
  };
}