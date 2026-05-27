"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.closeDb = closeDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../lib/logger");
let _db = null;
function getDb() {
    if (_db)
        return _db;
    const dbPath = process.env.DB_PATH || path_1.default.join(process.cwd(), 'data', 'app.db');
    // Ensure directory exists
    const fs = require('fs');
    const dir = path_1.default.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    _db = new better_sqlite3_1.default(dbPath);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    _db.pragma('synchronous = NORMAL');
    logger_1.logger.info(`SQLite database opened at ${dbPath}`);
    return _db;
}
function closeDb() {
    if (_db) {
        _db.close();
        _db = null;
        logger_1.logger.info('SQLite database closed');
    }
}
//# sourceMappingURL=client.js.map