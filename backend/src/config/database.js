// backend/src/config/database.js
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'database', 'expense-tracker.db');

// Ensure the database directory exists
const fs = require('fs');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

// Run schema to create tables if they don't exist
const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
} else {
  console.warn('Schema file not found at', schemaPath);
}

module.exports = db;