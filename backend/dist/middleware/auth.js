"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
function authMiddleware(req, res, next) {
    const key = process.env.APP_API_KEY;
    if (!key) {
        next();
        return;
    }
    const header = req.headers['x-api-key'] ?? req.headers['authorization']?.replace('Bearer ', '');
    if (header !== key) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map