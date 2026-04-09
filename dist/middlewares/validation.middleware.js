"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAll = exports.validateBodyAndParams = exports.validateQueryAndParams = exports.validateParams = exports.validateQuery = exports.validateBody = exports.validateRequest = void 0;
const zod_1 = require("zod");
/**
 * Validation middleware factory
 * Creates a middleware that validates request data against Zod schemas
 */
const validateRequest = (schemas) => {
    return async (req, res, next) => {
        try {
            // Validate request body if schema is provided
            if (schemas.body) {
                const validatedBody = await schemas.body.parseAsync(req.body);
                req.body = validatedBody;
            }
            // Validate request query if schema is provided
            if (schemas.query) {
                const validatedQuery = await schemas.query.parseAsync(req.query);
                req.query = validatedQuery;
            }
            // Validate request params if schema is provided
            if (schemas.params) {
                const validatedParams = await schemas.params.parseAsync(req.params);
                req.params = validatedParams;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Format Zod validation errors
                const formattedErrors = error.issues.map((err) => ({
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
exports.validateRequest = validateRequest;
/**
 * Convenience function for validating only request body
 */
const validateBody = (schema) => {
    return (0, exports.validateRequest)({ body: schema });
};
exports.validateBody = validateBody;
/**
 * Convenience function for validating only request query
 */
const validateQuery = (schema) => {
    return (0, exports.validateRequest)({ query: schema });
};
exports.validateQuery = validateQuery;
/**
 * Convenience function for validating only request params
 */
const validateParams = (schema) => {
    return (0, exports.validateRequest)({ params: schema });
};
exports.validateParams = validateParams;
/**
 * Convenience function for validating both query and params
 */
const validateQueryAndParams = (querySchema, paramsSchema) => {
    return (0, exports.validateRequest)({ query: querySchema, params: paramsSchema });
};
exports.validateQueryAndParams = validateQueryAndParams;
/**
 * Convenience function for validating body and params
 */
const validateBodyAndParams = (bodySchema, paramsSchema) => {
    return (0, exports.validateRequest)({ body: bodySchema, params: paramsSchema });
};
exports.validateBodyAndParams = validateBodyAndParams;
/**
 * Convenience function for validating all three (body, query, params)
 */
const validateAll = (bodySchema, querySchema, paramsSchema) => {
    return (0, exports.validateRequest)({ body: bodySchema, query: querySchema, params: paramsSchema });
};
exports.validateAll = validateAll;
