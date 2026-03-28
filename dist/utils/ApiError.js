"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.NotFoundError = exports.AuthError = exports.ValidationError = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], code, stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        if (code)
            this.code = code;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
// Pre-defined Error Types
class ValidationError extends ApiError {
    constructor(message = "Validation failed", errors = []) {
        super(400, message, errors, "VALIDATION_ERROR");
    }
}
exports.ValidationError = ValidationError;
class AuthError extends ApiError {
    constructor(message = "Authentication failed") {
        super(401, message, [], "AUTH_ERROR");
    }
}
exports.AuthError = AuthError;
class NotFoundError extends ApiError {
    constructor(message = "Resource not found") {
        super(404, message, [], "NOT_FOUND_ERROR");
    }
}
exports.NotFoundError = NotFoundError;
class DatabaseError extends ApiError {
    constructor(message = "Database operation failed", errors = []) {
        super(500, message, errors, "DATABASE_ERROR");
    }
}
exports.DatabaseError = DatabaseError;
