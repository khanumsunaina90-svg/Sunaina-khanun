// backend/src/config/database.js
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

// Choose DB location:
// • In local development we keep the DB under the project’s `database/` folder.
// • On Vercel (serverless) we must write to the writable `/tmp` directory.
const isVercel = !!process.env.VERCEL;
const defaultLocalPath = path.join(__dirname, '..', '..', 'database', 'expense-tracker.db');
const dbPath = process.env.DB_PATH || (isVercel ? path.join('/tmp', 'expense-tracker.db') : defaultLocalPath);

// Ensure the directory exists (only for the local path; `/tmp` always exists).
const fs = require('fs');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir) && !isVercel) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

// Run schema to create tables if they are missing.
const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
} else {
  console.warn('Schema file not found at', schemaPath);
}

module.exports = db;
