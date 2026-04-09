import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validation middleware factory
 * Creates a middleware that validates request data against Zod schemas
 */
export const validateRequest = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body if schema is provided
      if (schemas.body) {
        const validatedBody = await schemas.body.parseAsync(req.body);
        req.body = validatedBody;
      }

      // Validate request query if schema is provided
      if (schemas.query) {
        const validatedQuery = await schemas.query.parseAsync(req.query);
        (req.query as any) = validatedQuery;
      }

      // Validate request params if schema is provided
      if (schemas.params) {
        const validatedParams = await schemas.params.parseAsync(req.params);
        (req.params as any) = validatedParams;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
const formattedErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      // Handle other errors
      return next(error);
    }
  };
};

/**
 * Convenience function for validating only request body
 */
export const validateBody = (schema: ZodSchema) => {
  return validateRequest({ body: schema });
};

/**
 * Convenience function for validating only request query
 */
export const validateQuery = (schema: ZodSchema) => {
  return validateRequest({ query: schema });
};

/**
 * Convenience function for validating only request params
 */
export const validateParams = (schema: ZodSchema) => {
  return validateRequest({ params: schema });
};

/**
 * Convenience function for validating both query and params
 */
export const validateQueryAndParams = (querySchema: ZodSchema, paramsSchema: ZodSchema) => {
  return validateRequest({ query: querySchema, params: paramsSchema });
};

/**
 * Convenience function for validating body and params
 */
export const validateBodyAndParams = (bodySchema: ZodSchema, paramsSchema: ZodSchema) => {
  return validateRequest({ body: bodySchema, params: paramsSchema });
};

/**
 * Convenience function for validating all three (body, query, params)
 */
export const validateAll = (bodySchema: ZodSchema, querySchema: ZodSchema, paramsSchema: ZodSchema) => {
  return validateRequest({ body: bodySchema, query: querySchema, params: paramsSchema });
};
