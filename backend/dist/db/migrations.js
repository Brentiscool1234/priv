"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const client_1 = require("./client");
const schema_1 = require("./schema");
const logger_1 = require("../lib/logger");
function runMigrations() {
    const db = (0, client_1.getDb)();
    logger_1.logger.info('Running database migrations...');
    // Split into individual statements and execute each
    const statements = schema_1.SCHEMA_SQL
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    const migrate = db.transaction(() => {
        for (const stmt of statements) {
            db.prepare(stmt).run();
        }
    });
    migrate();
    logger_1.logger.info('Database migrations complete');
}
//# sourceMappingURL=migrations.js.map