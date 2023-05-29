const router = express.Router();

// get all data for @me
router.get('/data/@me', async (req, res) => {
    // retrieve user information, excluding token, and all expenses
    const db = await _db;
    const user = await db.get('SELECT id, name, email, picture FROM users WHERE id = ?', req.user.id);
    const expenses = await db.all('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', req.user.id);
    // create date by combining column month and column year and then sort by date
    const reports = await db.all('SELECT * FROM reports WHERE user_id = ? ORDER BY date(year || "-" || month || "-01") DESC', req.user.id);

    // return user and expenses
    res.json({ user, expenses, reports });
});

module.exports = router;