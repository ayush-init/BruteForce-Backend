"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError_1.ApiError)) {
        const statusCode = error.statusCode ? error.statusCode : 500;
        const message = error.message || 'Something went wrong';
        error = new ApiError_1.ApiError(statusCode, message, error?.errors || [], "INTERNAL_ERROR", err.stack);
    }
    // Log error using our new logger
    logger_1.logger.error(`${error.code || 'ERROR'} - ${error.message}`, error);
    const response = {
        success: false,
        message: error.message,
        code: error.code || 'ERROR',
        statusCode: error.statusCode,
        // Only send stack trace in dev
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    };
    res.status(error.statusCode).json(response);
};
exports.errorHandler = errorHandler;
