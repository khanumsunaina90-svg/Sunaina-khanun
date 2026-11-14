// backend/src/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (project root)
const frontendRoot = path.resolve(__dirname, '..', '..');
app.use(express.static(frontendRoot));

// API routes
const transactionsRouter = require('./routes/transactions');
const budgetsRouter = require('./routes/budgets');
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);

// 404 for unknown API routes
app.use('/api/*', require('./middleware/notFound'));

// Central error handling
app.use(require('./middleware/errorHandler'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
