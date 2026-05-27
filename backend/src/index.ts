import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { runMigrations } from './db/migrations';
import { authMiddleware } from './middleware/auth';
import { projectsRouter } from './routes/projects';
import { servicesRouter } from './routes/services';
import { locationsRouter } from './routes/locations';
import { sitemapRouter } from './routes/sitemap';
import { briefsRouter } from './routes/briefs';
import { contentRouter } from './routes/content';
import { wordpressRouter } from './routes/wordpress';
import { qaRouter } from './routes/qa';
import { logger } from './lib/logger';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use(limiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// All routes require API key
app.use('/api', authMiddleware);

app.use('/api/projects', projectsRouter);
app.use('/api/projects/:id/services', servicesRouter);
app.use('/api/projects/:id/locations', locationsRouter);
app.use('/api/projects/:id/sitemap', sitemapRouter);
app.use('/api/projects/:id/briefs', briefsRouter);
app.use('/api/projects/:id/content', contentRouter);
app.use('/api/projects/:id/wp', wordpressRouter);
app.use('/api/projects/:id/qa', qaRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

runMigrations();

app.listen(PORT, () => {
  logger.info(`Backend API listening on http://localhost:${PORT}`);
});

export { app };
