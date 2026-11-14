// backend/src/controllers/budgetsController.js
const db = require('../config/database');

function validateBudget(data) {
  const errors = [];
  const { month, year, amount } = data;
  if (!Number.isInteger(month) || month < 1 || month > 12) errors.push('Month must be an integer between 1 and 12');
  if (!Number.isInteger(year) || year < 1970) errors.push('Year must be a valid integer');
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) errors.push('Amount must be a positive number');
  return errors;
}

// GET /api/budgets/:year/:month
exports.getOne = (req, res, next) => {
  const { year, month } = req.params;
  const stmt = db.prepare('SELECT * FROM monthly_budgets WHERE year = ? AND month = ?');
  const row = stmt.get(parseInt(year, 10), parseInt(month, 10));
  if (!row) return res.status(404).json({ status: 404, message: 'Budget not found' });
  res.json(row);
};

// POST /api/budgets
exports.create = (req, res, next) => {
  const { month, year, amount } = req.body;
  const errors = validateBudget({ month, year, amount });
  if (errors.length) return res.status(400).json({ status: 400, message: errors.join('; ') });
  try {
    const stmt = db.prepare('INSERT INTO monthly_budgets (month, year, amount) VALUES (?, ?, ?)');
    const info = stmt.run(month, year, Number(amount.toFixed(2)));
    const newRow = db.prepare('SELECT * FROM monthly_budgets WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newRow);
  } catch (err) {
    // SQLite throws when UNIQUE constraint fails
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ status: 409, message: 'Budget for this month already exists' });
    }
    next(err);
  }
};

// PUT /api/budgets/:id
exports.update = (req, res, next) => {
  const { id } = req.params;
  const { month, year, amount } = req.body;
  const errors = validateBudget({ month, year, amount });
  if (errors.length) return res.status(400).json({ status: 400, message: errors.join('; ') });
  try {
    const stmt = db.prepare('UPDATE monthly_budgets SET month = ?, year = ?, amount = ? WHERE id = ?');
    const info = stmt.run(month, year, Number(amount.toFixed(2)), id);
    if (info.changes === 0) return res.status(404).json({ status: 404, message: 'Budget not found' });
    const updated = db.prepare('SELECT * FROM monthly_budgets WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
