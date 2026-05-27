import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure, responds with 400 and a structured error message.
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = formatZodError(result.error);
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
      return;
    }
    // Replace body with the parsed (and coerced) value
    req.body = result.data;
    next();
  };
}

/**
 * Returns an Express middleware that validates req.query against the given Zod schema.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = formatZodError(result.error);
      res.status(400).json({
        error: 'Query validation failed',
        details: errors,
      });
      return;
    }
    (req as Request & { parsedQuery: T }).parsedQuery = result.data;
    next();
  };
}

function formatZodError(err: ZodError): Array<{ path: string; message: string }> {
  return err.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));
}
