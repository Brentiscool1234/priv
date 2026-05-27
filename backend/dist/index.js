"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const migrations_1 = require("./db/migrations");
const auth_1 = require("./middleware/auth");
const projects_1 = require("./routes/projects");
const services_1 = require("./routes/services");
const locations_1 = require("./routes/locations");
const sitemap_1 = require("./routes/sitemap");
const briefs_1 = require("./routes/briefs");
const content_1 = require("./routes/content");
const wordpress_1 = require("./routes/wordpress");
const qa_1 = require("./routes/qa");
const logger_1 = require("./lib/logger");
const app = (0, express_1.default)();
exports.app = app;
const PORT = parseInt(process.env.PORT ?? '4000', 10);
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express_1.default.json({ limit: '10mb' }));
const limiter = (0, express_rate_limit_1.default)({ windowMs: 60000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use(limiter);
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
// All routes require API key
app.use('/api', auth_1.authMiddleware);
app.use('/api/projects', projects_1.projectsRouter);
app.use('/api/projects/:id/services', services_1.servicesRouter);
app.use('/api/projects/:id/locations', locations_1.locationsRouter);
app.use('/api/projects/:id/sitemap', sitemap_1.sitemapRouter);
app.use('/api/projects/:id/briefs', briefs_1.briefsRouter);
app.use('/api/projects/:id/content', content_1.contentRouter);
app.use('/api/projects/:id/wp', wordpress_1.wordpressRouter);
app.use('/api/projects/:id/qa', qa_1.qaRouter);
app.use((err, _req, res, _next) => {
    logger_1.logger.error('Unhandled error', { message: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
(0, migrations_1.runMigrations)();
app.listen(PORT, () => {
    logger_1.logger.info(`Backend API listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map