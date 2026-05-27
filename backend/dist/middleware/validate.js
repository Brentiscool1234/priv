"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateQuery = validateQuery;
/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure, responds with 400 and a structured error message.
 */
function validate(schema) {
    return (req, res, next) => {
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
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const errors = formatZodError(result.error);
            res.status(400).json({
                error: 'Query validation failed',
                details: errors,
            });
            return;
        }
        req.parsedQuery = result.data;
        next();
    };
}
function formatZodError(err) {
    return err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
    }));
}
//# sourceMappingURL=validate.js.map