export class ApiError extends Error {
  statusCode: number;
  data: any;
  success: boolean;
  errors: any[];
  code?: string;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    code?: string,
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (code) this.code = code;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Pre-defined Error Types
export class ValidationError extends ApiError {
  constructor(message: string = "Validation failed", errors: any[] = []) {
    super(400, message, errors, "VALIDATION_ERROR");
  }
}

export class AuthError extends ApiError {
  constructor(message: string = "Authentication failed") {
    super(401, message, [], "AUTH_ERROR");
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(404, message, [], "NOT_FOUND_ERROR");
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = "Database operation failed", errors: any[] = []) {
    super(500, message, errors, "DATABASE_ERROR");
  }
}
