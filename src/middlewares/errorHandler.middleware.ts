import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? error.statusCode : 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, error?.errors || [], "INTERNAL_ERROR", err.stack);
  }

  // Log error using our new logger
  logger.error(`${error.code || 'ERROR'} - ${error.message}`, error);

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