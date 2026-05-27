import { getDb } from './client';
import { SCHEMA_SQL } from './schema';
import { logger } from '../lib/logger';

export function runMigrations(): void {
  const db = getDb();
  logger.info('Running database migrations...');
  db.exec(SCHEMA_SQL);
  logger.info('Database migrations complete');
}
