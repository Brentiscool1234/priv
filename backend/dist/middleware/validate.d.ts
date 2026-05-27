import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure, responds with 400 and a structured error message.
 */
export declare function validate<T>(schema: ZodSchema<T>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Returns an Express middleware that validates req.query against the given Zod schema.
 */
export declare function validateQuery<T>(schema: ZodSchema<T>): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map