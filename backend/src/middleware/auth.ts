import type { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
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
