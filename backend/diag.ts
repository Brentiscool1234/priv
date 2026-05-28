// Run with: npx tsx diag.ts
// Finds which import is crashing the backend
const tests: Array<[string, () => unknown]> = [
  ['dotenv',             () => require('dotenv/config')],
  ['express',            () => require('express')],
  ['cors',               () => require('cors')],
  ['helmet',             () => require('helmet')],
  ['express-rate-limit', () => require('express-rate-limit')],
  ['winston',            () => require('winston')],
  ['uuid',               () => require('uuid')],
  ['openai',             () => require('openai')],
  ['node:sqlite',        () => require('node:sqlite')],
  ['node-fetch',         () => require('node-fetch')],
];

for (const [name, load] of tests) {
  try {
    load();
    console.log('OK  ', name);
  } catch (e: any) {
    console.error('FAIL', name, '->', e.message);
  }
}

console.log('\n--- local modules ---');

const localTests: Array<[string, () => unknown]> = [
  ['logger',      () => require('./src/lib/logger')],
  ['db/client',   () => require('./src/db/client')],
  ['migrations',  () => require('./src/db/migrations')],
  ['auth',        () => require('./src/middleware/auth')],
  ['r/projects',  () => require('./src/routes/projects')],
  ['r/services',  () => require('./src/routes/services')],
  ['r/locations', () => require('./src/routes/locations')],
  ['r/sitemap',   () => require('./src/routes/sitemap')],
  ['r/briefs',    () => require('./src/routes/briefs')],
  ['r/content',   () => require('./src/routes/content')],
  ['r/wordpress', () => require('./src/routes/wordpress')],
  ['r/qa',        () => require('./src/routes/qa')],
];

for (const [name, load] of localTests) {
  try {
    load();
    console.log('OK  ', name);
  } catch (e: any) {
    console.error('FAIL', name, '->', e.message);
  }
}

console.log('\n--- runtime tests ---');

// Test actual database creation + migration
try {
  const path = require('path');
  const fs = require('fs');
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.join(process.cwd(), 'diag-test.db');
  console.log('DB path:', dbPath);
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY)');
  db.close();
  fs.unlinkSync(dbPath);
  console.log('OK   DatabaseSync create+migrate+close');
} catch (e: any) {
  console.error('FAIL DatabaseSync ->', e.message);
}

// Test port 4000
try {
  const net = require('net');
  const server = net.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', (e: any) => {
      console.error('FAIL port 4000 ->', e.message, '(port already in use — kill the process using it)');
      resolve();
    });
    server.once('listening', () => {
      console.log('OK   port 4000 is free');
      server.close();
      resolve();
    });
    server.listen(4000, '0.0.0.0');
  });
} catch (e: any) {
  console.error('FAIL port test ->', e.message);
}

console.log('\nDone.');
