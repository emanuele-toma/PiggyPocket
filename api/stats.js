const router = express.Router();

router.get('/stats/@me', async (req, res) => {
    const db = await _db;
    const userId = req.user.id;

    const categoryQuery = `
    SELECT category, SUM(amount) AS total_amount
    FROM expenses
    WHERE user_id = ? AND date >= date('now', '-12 months')
    GROUP BY category`;

    const monthlyExpensesQuery = `
    SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total_amount
    FROM expenses
    WHERE user_id = ? AND date >= date('now', '-12 months')
    GROUP BY month
    ORDER BY month`;

    const monthlyIncomeQuery = `
    SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total_amount
    FROM expenses
    WHERE user_id = ? AND amount > 0 AND date >= date('now', '-12 months')
    GROUP BY month
    ORDER BY month`;

    const weeklyTransactionsQuery = `
    SELECT strftime('%w', date) AS day_of_week, COUNT(*) AS transaction_count
    FROM expenses
    WHERE user_id = ? AND date >= date('now', '-12 months')
    GROUP BY day_of_week
    ORDER BY day_of_week`;

    try {
        const category = await db.all(categoryQuery, userId);
        const monthlyExpenses = await db.all(monthlyExpensesQuery, userId);
        const monthlyIncome = await db.all(monthlyIncomeQuery, userId);
        const weeklyTransactions = await db.all(weeklyTransactionsQuery, userId);

        const stats = {
            category,
            monthlyExpenses,
            monthlyIncome,
            weeklyTransactions,
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving stats data' });
    }
});

module.exports = router;