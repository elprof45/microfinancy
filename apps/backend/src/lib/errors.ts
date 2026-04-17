/**
 * Custom error types for structured error handling
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Array<{ field?: string; code: string; message: string }>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Array<{ field?: string; code: string; message: string }>
  ) {
    super(422, message, details);
    this.name = "ValidationError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(401, message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class ServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(500, message);
    this.name = "ServerError";
  }
}

/**
 * Format error response
 */
export const formatErrorResponse = (
  error: unknown
): {
  success: boolean;
  error: string;
  details?: Array<{ field?: string; code: string; message: string }>;
  statusCode: number;
} => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }

  return {
    success: false,
    error: "An unknown error occurred",
    statusCode: 500,
  };
};
