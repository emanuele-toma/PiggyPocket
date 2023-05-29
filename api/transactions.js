const router = express.Router();

router.get('/transactions/@me', async (req, res) => {
    const db = await _db;
    const { page, category, type, date_span, search } = req.query;

    // Pagination parameters
    const pageSize = 10; // Number of transactions per page
    const offset = (parseInt(page || 1) - 1) * pageSize;

    // SQL query for filtered transactions
    let sql = 'SELECT * FROM expenses WHERE user_id = ?';
    let countSql = 'SELECT COUNT(*) AS total FROM expenses WHERE user_id = ?';

    // Parameters for filtering
    const params = [req.user.id];
    const countParams = [req.user.id];
    const filters = [];

    // Add filters based on query parameters
    if (category) {
        filters.push('category = ?');
        params.push(category);
        countParams.push(category);
    }

    if (type) {
        if (type == 'income') {
            filters.push('amount >= ?');
            params.push(0);
            countParams.push(0);
        } else {
            filters.push('amount <= ?');
            params.push(0);
            countParams.push(0);
        }
    }

    if (date_span) {
        let startDate = null;
        const currentDate = new Date();

        if (date_span === 'week') {
            startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (date_span === 'month') {
            startDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
                currentDate.getDate(),
                currentDate.getHours(),
                currentDate.getMinutes(),
                currentDate.getSeconds()
            );
        } else if (date_span === 'year') {
            startDate = new Date(
                currentDate.getFullYear() - 1,
                currentDate.getMonth(),
                currentDate.getDate(),
                currentDate.getHours(),
                currentDate.getMinutes(),
                currentDate.getSeconds()
            );
        }

        if (startDate) {
            filters.push('date >= ?');
            params.push(startDate.toISOString());
            countParams.push(startDate.toISOString());
        }
    }

    if (search) {
        filters.push('(description LIKE ? OR payee LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`);
    }

    // Add filters to the SQL query if any filters exist
    if (filters.length > 0) {
        sql += ` AND ${filters.join(' AND ')}`;
        countSql += ` AND ${filters.join(' AND ')}`;
    }

    // Append pagination to the SQL query
    sql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    // Execute the query for filtered transactions
    const expenses = await db.all(sql, params);

    // Execute the query for the total count of rows
    const countResult = await db.get(countSql, countParams);
    const totalPages = countResult.total;

    res.json({ expenses, totalPages });
});

// same but for a specific transaction
router.get('/transactions/@me/:id', async (req, res) => {
    const db = await _db;
    const expense = await db.get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', req.params.id, req.user.id);
    res.json(expense);
});

router.post('/transactions/@me', async (req, res) => {
    const db = await _db;
    const { payee, category, description, amount, date } = req.body;

    // do appropriate checks, each check is separated with it's own error message
    if (!payee || payee.trim().length < 1)
        return res.status(400).json({ error: 'Payee is required' });
    if (!category || category.trim().length < 1)
        return res.status(400).json({ error: 'Category is required' });
    if (!description || description.trim().length < 1)
        return res.status(400).json({ error: 'Description is required' });
    if (!amount || isNaN(amount))
        return res.status(400).json({ error: 'Amount is required and must be a number' });
    if (!date || isNaN(Date.parse(date)))
        return res.status(400).json({ error: 'Date is required and must be a valid date' });

    const user_id = req.user.id;

    // generate transaction id that is an hash between user_id and a uuid
    const transaction_id = 'tr' + crypto.createHash('sha256').update(`${user_id}${crypto.randomUUID()}`).digest('hex');

    const sql = 'INSERT INTO expenses (id, user_id, payee, category, description, amount, date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [transaction_id, user_id, payee, category, description, amount, date];
    const result = await db.run(sql, params);

    if (result.changes == 1) {
        res.status(201).json({ id: result.lastID });
    } else {
        res.status(500).json({ error: 'Something went wrong, please try again later...' });
    }
});

// put
router.put('/transactions/@me/:id', async (req, res) => {
    const db = await _db;
    const { payee, category, description, amount, date } = req.body;

    // do appropriate checks, each check is separated with it's own error message
    if (!payee || payee.trim().length < 1)
        return res.status(400).json({ error: 'Payee is required' });
    if (!category || category.trim().length < 1)
        return res.status(400).json({ error: 'Category is required' });
    if (!description || description.trim().length < 1)
        return res.status(400).json({ error: 'Description is required' });
    if (!amount || isNaN(amount))
        return res.status(400).json({ error: 'Amount is required and must be a number' });
    if (!date || isNaN(Date.parse(date)))
        return res.status(400).json({ error: 'Date is required and must be a valid date' });

    const user_id = req.user.id;
    const sql = 'UPDATE expenses SET payee = ?, category = ?, description = ?, amount = ?, date = ? WHERE id = ? AND user_id = ?';
    const params = [payee, category, description, amount, date, req.params.id, user_id];
    const result = await db.run(sql, params);

    if (result.changes == 1) {
        res.status(200).json({ id: req.params.id });
    } else {
        res.status(500).json({ error: 'Something went wrong, please try again later...' });
    }
});

// delete
router.delete('/transactions/@me/:id', async (req, res) => {
    const db = await _db;
    const user_id = req.user.id;
    const sql = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';
    const params = [req.params.id, user_id];
    const result = await db.run(sql, params);

    if (result.changes == 1) {
        res.status(200).json({ id: req.params.id });
    } else {
        res.status(500).json({ error: 'Something went wrong, please try again later...' });
    }
});

module.exports = router;