// backend/src/controllers/transactionsController.js
const db = require('../config/database');

// Helper to validate transaction payload
function validateTransaction(data) {
  const errors = [];
  if (!data.title || typeof data.title !== 'string') errors.push('Title is required');
  if (typeof data.amount !== 'number' || isNaN(data.amount) || data.amount <= 0) errors.push('Amount must be a positive number');
  if (!data.category || typeof data.category !== 'string') errors.push('Category is required');
  if (!['income', 'expense'].includes(data.type)) errors.push('Type must be "income" or "expense"');
  // Simple YYYY-MM-DD regex
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) errors.push('Date must be in YYYY-MM-DD format');
  // description optional
  return errors;
}

// GET /api/transactions – return all transactions newest first
exports.getAll = (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions/:id – single transaction
exports.getOne = (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
    const row = stmt.get(req.params.id);
    if (!row) return res.status(404).json({ status: 404, message: 'Transaction not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

// POST /api/transactions – create
exports.create = (req, res, next) => {
  const data = req.body;
  const errors = validateTransaction(data);
  if (errors.length) return res.status(400).json({ status: 400, message: errors.join('; ') });
  try {
    const stmt = db.prepare(`INSERT INTO transactions (title, amount, category, type, date, description)
      VALUES (?, ?, ?, ?, ?, ?)`);
    const info = stmt.run(
      data.title,
      Number(data.amount.toFixed(2)),
      data.category,
      data.type,
      data.date,
      data.description || null
    );
    const newRow = db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newRow);
  } catch (err) {
    next(err);
  }
};

// PUT /api/transactions/:id – update
exports.update = (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  const errors = validateTransaction(data);
  if (errors.length) return res.status(400).json({ status: 400, message: errors.join('; ') });
  try {
    const stmt = db.prepare(`UPDATE transactions SET title = ?, amount = ?, category = ?, type = ?, date = ?, description = ? WHERE id = ?`);
    const info = stmt.run(
      data.title,
      Number(data.amount.toFixed(2)),
      data.category,
      data.type,
      data.date,
      data.description || null,
      id
    );
    if (info.changes === 0) return res.status(404).json({ status: 404, message: 'Transaction not found' });
    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transactions/:id – delete
exports.remove = (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ status: 404, message: 'Transaction not found' });
    res.json({ status: 200, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
