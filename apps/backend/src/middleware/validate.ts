import { Context, Next } from "hono";
import { z } from "zod";
import { ValidationError } from "../lib/errors";

/**
 * Validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Middleware function
 */
export const validateBody = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      // Store validated data in context for use in handler
      (c as any).validatedBody = validated;
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join("."),
          code: err.code,
          message: err.message,
        }));

        return c.json(
          {
            success: false,
            error: "Validation failed",
            details,
            statusCode: 422,
          },
          422
        );
      }

      throw error;
    }
  };
};

/**
 * Validate query parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Middleware function
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);
      // Store validated query in context for use in handler
      (c as any).validatedQuery = validated;
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join("."),
          code: err.code,
          message: err.message,
        }));

        return c.json(
          {
            success: false,
            error: "Query validation failed",
            details,
            statusCode: 422,
          },
          422
        );
      }

      throw error;
    }
  };
};

/**
 * Helper to get validated body from context
 */
export const getValidatedBody = (c: Context): any => {
  return (c as any).validatedBody;
};

/**
 * Helper to get validated query from context
 */
export const getValidatedQuery = (c: Context): any => {
  return (c as any).validatedQuery;
};
