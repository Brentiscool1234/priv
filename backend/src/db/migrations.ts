import { getDb } from './client';
import { SCHEMA_SQL } from './schema';
import { logger } from '../lib/logger';

export function runMigrations(): void {
  const db = getDb();

  logger.info('Running database migrations...');

  // Split into individual statements and execute each
  const statements = SCHEMA_SQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const migrate = db.transaction(() => {
    for (const stmt of statements) {
      db.prepare(stmt).run();
    }
  });

  migrate();
  logger.info('Database migrations complete');
}
