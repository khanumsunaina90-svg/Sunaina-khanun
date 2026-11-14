// backend/src/routes/budgets.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/budgetsController');

// Get budget for a specific month/year
router.get('/:year/:month', controller.getOne);
// Create a new budget for month
router.post('/', controller.create);
// Update an existing budget by id
router.put('/:id', controller.update);

module.exports = router;
