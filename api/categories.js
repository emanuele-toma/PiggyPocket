const Database = require('../classes/database');
const _db = new Database();

const express = require('express');
const router = express.Router();

// get /api/categories/@me
router.get('/categories/@me', async (req, res) => {
    let defaultCategories = [
        'Food',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills',
        'Health',
        'Travel',
        'Education'
    ];

    const db = await _db;
    const categories = await db.all('SELECT DISTINCT category FROM expenses WHERE user_id = ?', req.user.id);

    // combine arrays and remove duplicates
    const combined = [...new Set([...categories.map(c => c.category), ...defaultCategories])];

    res.json(combined);
});

module.exports = router;