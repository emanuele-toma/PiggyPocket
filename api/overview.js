const Database = require('../classes/database');
const _db = new Database();

const express = require('express');
const router = express.Router();

// get data for overview
router.get('/overview/@me', async (req, res) => {
    // retrieve count of transactions, total amount of expenses and income by month
    const db = await _db;
    const userId = req.user.id;

    const transactionCountQuery = `
    SELECT strftime('%Y-%m', date) AS month, COUNT(*) AS total_count
    FROM expenses
    WHERE user_id = ?
    GROUP BY month
    ORDER BY month DESC`;

    const totalExpensesQuery = `
    SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total_amount
    FROM expenses
    WHERE user_id = ? AND amount < 0
    GROUP BY month
    ORDER BY month DESC`;

    const totalIncomeQuery = `
    SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total_amount
    FROM expenses
    WHERE user_id = ? AND amount > 0
    GROUP BY month
    ORDER BY month DESC`;

    try {
        const transactionCount = await db.all(transactionCountQuery, userId);
        const totalExpenses = await db.all(totalExpensesQuery, userId);
        const totalIncome = await db.all(totalIncomeQuery, userId);

        const overview = {
            transactionCount,
            totalExpenses,
            totalIncome,
        };

        res.json(overview);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving overview data' });
    }
});

module.exports = router;