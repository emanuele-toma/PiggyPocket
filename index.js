// Initialize env
require('dotenv').config();

// Use node-fetch
const fetch = require('node-fetch');

// Use crypto
const crypto = require('crypto');

// Express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`In ascolto su porta: ${port}`));

// Database
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const _db = sqlite.open({
    filename: './database/database.sqlite',
    driver: sqlite3.Database
});

(async () => {

    // Initialize tables
    const db = await _db;

    // Table users
    // id: TEXT
    // name: TEXT
    // email: TEXT
    // picture: TEXT
    // token: TEXT
    await db.run('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, picture TEXT, token TEXT)');
    await db.run('CREATE UNIQUE INDEX IF NOT EXISTS email ON users (email)');

    // Table expenses
    // id: TEXT
    // user_id: TEXT
    // date: TEXT
    // amount: REAL
    // description: TEXT
    // category: TEXT
    // payee: TEXT
    await db.run('CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, user_id TEXT, date TEXT, amount REAL, description TEXT, category TEXT, payee TEXT)');
    await db.run('CREATE INDEX IF NOT EXISTS user_id ON expenses (user_id)');


    // Table reports
    // id: TEXT
    // user_id: TEXT
    // year: INTEGER (UNIQUE with month)
    // month: INTEGER (UNIQUE with year)
    // content: TEXT
    await db.run('CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, user_id TEXT, year INTEGER, month INTEGER, content TEXT)');
    await db.run('CREATE UNIQUE INDEX IF NOT EXISTS user_id_year_month ON reports (user_id, year, month)');
})()

// Initialize passport
const passport = require('passport');
const session = require('express-session');

app.use(passport.initialize());

// Use session, save session using sqlite in database: sessions.sqlite
app.use(session({
    store: new (require('connect-sqlite3')(session))({
        db: 'sessions.sqlite',
        dir: './database'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 // 1 Year
    }
}));

app.use(passport.session());

// Use google authetication
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Use strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.REDIRECT_HOST}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    // Check if user exists
    const db = await _db;
    const user = await db.get('SELECT * FROM users WHERE id = ?', profile.id);
    if (user) {
        await db.run('UPDATE users SET name = ?, picture = ? WHERE id = ?', profile.displayName, profile.photos[0].value, profile.id);
        done(null, user);
    } else {
        // User does not exist
        await db.run('INSERT INTO users (id, name, email, picture) VALUES (?, ?, ?, ?)', profile.id, profile.displayName, profile.emails[0].value, profile.photos[0].value);
        done(null, profile);
    }
}));

// Implement serialize and deserialize
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google',
    {
        failureRedirect: '/?error=true'
    }), (req, res) => {
        res.redirect('/home');
    });

// auth middleware
const auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

const combinedAuth = async (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        // default token locations such as headers and body
        const token = req.headers['Authorization'] || req.body.token;

        if (token) {
            const db = await _db;

            // hash token
            const hashToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await db.get('SELECT * FROM users WHERE token = ?', hashToken);

            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).json({
                    error: 'Invalid token'
                });
            }
        } else {
            res.status(401).json({
                error: 'Token missing'
            });
        }
    }
}

app.get('/auth/token', auth, async (req, res) => {
    const db = await _db;
    let token = 'T-' + crypto.randomUUID();
    let hashToken = crypto.createHash('sha256').update(token).digest('hex');

    // check if token already exists
    let user = await db.get('SELECT * FROM users WHERE token = ?', hashToken);
    while (user) {
        token = 'T-' + crypto.randomUUID();
        hashToken = crypto.createHash('sha256').update(token).digest('hex');
        user = await db.get('SELECT * FROM users WHERE token = ?', hashToken);
    }

    await db.run('UPDATE users SET token = ? WHERE id = ?', hashToken, req.user.id);
    res.json({
        token
    });
});

app.delete('/auth/delete', auth, async (req, res) => {
    const db = await _db;
    await db.run('DELETE FROM users WHERE id = ?', req.user.id);
    await db.run('DELETE FROM expenses WHERE user_id = ?', req.user.id);
    await db.run('DELETE FROM reports WHERE user_id = ?', req.user.id);
    req.logout((err) => {
        if (err) return next(err);
    });
    res.json({
        success: true
    });
});

// protect home route then pass to next middleware
app.get('/home/*', auth, (req, res, next) => {
    next();
});

// set favicon as /public/assets/favicon.ico by sending it as a file using static
app.use('/favicon.ico', express.static('public/assets/favicon.ico'));

// Use public as static folder
app.use(express.static('public'));

// Get /logout and logout user
app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

// get /assets/default_user.png return random file from /assets/default_users
app.get('/assets/default_user.png', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'public/assets/default_users');
    const files = fs.readdirSync(dir);
    const file = files[Math.floor(Math.random() * files.length)];
    res.sendFile(path.join(dir, file));
});

// Api

// Protect api routes
app.use('/api/*', combinedAuth, express.json());

// Get /api/users/@me
app.get('/api/users/@me', async (req, res) => {
    const db = await _db;
    const user = await db.get('SELECT id, name, email, picture FROM users WHERE id = ?', req.user.id);
    res.json(user);
});

app.get('/api/transactions/@me', async (req, res) => {
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
app.get('/api/transactions/@me/:id', async (req, res) => {
    const db = await _db;
    const expense = await db.get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', req.params.id, req.user.id);
    res.json(expense);
});

// get /api/image/:id
app.get('/api/payee_picture/:id', async (req, res) => {
    // check if file exists in folder /assets/payees/:id, ignore extension, if exists send it, else send default image
    const fs = require('fs');
    const path = require('path');
    let payee = req.params.id;
    const dir = path.join(__dirname, 'public/assets/payees');
    const files = fs.readdirSync(dir);
    if (files.length > 0) {
        // replace spaces with underscores
        payee = payee.replace(/\s/g, '_').toLowerCase();

        const file = files.find(f => f.split('.')[0].toLowerCase() == payee)?.split('.')[0];

        if (file) {
            res.sendFile(path.join(__dirname, `public/assets/payees/${file}.png`));
        } else {
            res.sendFile(path.join(__dirname, 'public/assets/payees/default.png'));
        }
    } else {
        res.sendFile(path.join(__dirname, 'public/assets/payees/default.png'));
    }
});

// get /api/categories/@me
app.get('/api/categories/@me', async (req, res) => {
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

// get /api/payees/@me
app.get('/api/payees/@me', async (req, res) => {
    let defaultPayees = [
        "Netflix",
        "Amazon",
        "Ebay",
        "Esselunga",
        "Coop",
        "Conad",
        "Carrefour",
        "Ipercoop",
        "Lidl",
        "Pam",
        "Unieuro",
        "MediaWorld",
        "Enel",
        "Eni",
        "TIM",
        "Vodafone",
        "Fastweb",
        "Trenitalia",
        "Alitalia",
        "Poste Italiane",
        "Sky Italia",
        "Uber",
        "Deliveroo",
        "Glovo",
        "Just Eat",
        "PayPal",
        "Google",
        "Apple",
        "Microsoft",
        "Samsung",
        "Huawei",
        "Sony",
        "Zara",
        "H&M",
        "Bershka",
        "Decathlon",
        "Intimissimi",
        "Yoox",
        "Booking.com",
        "Airbnb",
        "Ryanair",
        "EasyJet",
        "Mediaset",
        "Rai",
        "La Repubblica",
        "Corriere della Sera",
        "Sephora",
        "Ikea",
        "Euronics",
        "Blablacar",
        "LinkedIn",
        "Uber Eats",
        "Subito",
        "Groupon",
        "Allianz",
        "Generali",
        "Satispay",
        "Fineco Bank",
        "Banco BPM",
        "Intesa Sanpaolo",
        "UniCredit",
        "Mediolanum",
        "Banco Posta",
        "SuperEnalotto",
        "Gazzetta dello Sport",
        "Il Sole 24 Ore",
        "Trenord",
    ];

    const db = await _db;
    const payees = await db.all('SELECT DISTINCT payee FROM expenses WHERE user_id = ?', req.user.id);

    // combine arrays and remove duplicates
    const combined = [...new Set([...payees.map(p => p.payee), ...defaultPayees])];

    res.json(combined);
});

app.post('/api/transactions/@me', async (req, res) => {
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
app.put('/api/transactions/@me/:id', async (req, res) => {
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
app.delete('/api/transactions/@me/:id', async (req, res) => {
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

app.get('/api/stats/@me', async (req, res) => {
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

// get all data for @me
app.get('/api/data/@me', async (req, res) => {
    // retrieve user information, excluding token, and all expenses
    const db = await _db;
    const user = await db.get('SELECT id, name, email, picture FROM users WHERE id = ?', req.user.id);
    const expenses = await db.all('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', req.user.id);
    // create date by combining column month and column year and then sort by date
    const reports = await db.all('SELECT * FROM reports WHERE user_id = ? ORDER BY date(year || "-" || month || "-01") DESC', req.user.id);

    // return user and expenses
    res.json({ user, expenses, reports });
});

// get data for overview
app.get('/api/overview/@me', async (req, res) => {
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

// get data for single report
app.get('/api/reports/@me/:yearmonth', async (req, res) => {
    const db = await _db;
    const userId = req.user.id;

    const year = req.params.yearmonth.split('-')[0];
    const month = req.params.yearmonth.split('-')[1];

    const query = `
    SELECT *
    FROM reports
    WHERE user_id = ? AND year = ? AND month = ?`;

    try {
        const report = await db.get(query, userId, year, month);
        res.json(report || { content: '' });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving report data' });
    }
});

// same but post
app.post('/api/reports/@me/:yearmonth', async (req, res) => {
    const db = await _db;
    const userId = req.user.id;

    const year = req.params.yearmonth.split('-')[0];
    const month = req.params.yearmonth.split('-')[1];

    // check if a report already exists for this month
    const existingReport = await db.get('SELECT id FROM reports WHERE user_id = ? AND year = ? AND month = ?', userId, year, month);

    let prompt = `Imagine you're a financial advisor, help this user based on his expenses, give specific advice only for these expenses, the user cannot reply to you. Reply in italian. ${req.user.name}: Please give me a feedback on how to improve my finance, these are my expenses for this month ${month}/${year}: `;

    // find all transactions for this month. remember that expenses has a date field
    const transactions = await db.all('SELECT amount, description, category, payee FROM expenses WHERE user_id = ? AND strftime("%Y-%m", date) = ?', userId, `${year}-${month}`);

    // add header to table
    prompt += `\nAmount Description Category Payee`;

    // append transactions to prompt in a table like format
    transactions.forEach(transaction => {
        prompt += `\n${transaction.amount} ${transaction.description} ${transaction.category} ${transaction.payee}`;
    });

    let aiResponse = {};

    // fetch gptServer with post method passing prompt as json

    let gptServer = process.env.GPT_SERVER || 'http://localhost:8824';

    try {
        aiResponse = await fetch(`${gptServer}/api/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt }),
        }).then(res => res.json());

        while (aiResponse.response == 'Unable to fetch the response, Please try again.') {
            aiResponse = await fetch(`${gptServer}/api/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt }),
            }).then(res => res.json());
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error retrieving report data' });
    }

    // try to unescape unicode from response, without unescape as it is deprecated
    try {
        // split by newline then unescape unicode by json parsing and then join back
        aiResponse.response = aiResponse.response.split('\n').map(line => JSON.parse(`"${line}"`)).join('\n');
    } catch (error) {
    }
    aiResponse.response = aiResponse.response.replace(/(?<!\d|\.)\.(?!\.)/g, '.\n');
    aiResponse.response = aiResponse.response.replace(/\s*\n\s*/g, '\n');

    // create report
    let query = `
    INSERT INTO reports (id, user_id, year, month, content)
    VALUES (?, ?, ?, ?, ?)`;

    // if a report already exists, update it
    if (existingReport) {
        query = `
        UPDATE reports
        SET content = ?
        WHERE id = ?`;
    }

    const id = 'r' + crypto.createHash('sha256').update(`${userId}${crypto.randomUUID()}`).digest('hex');

    let params = [id, userId, year, month, aiResponse.response];

    if (existingReport) {
        params = [aiResponse.response, existingReport.id];
    }

    try {
        await db.run(query, params);
        res.json({ content: aiResponse.response });
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating report' });
    }
});

// randomdata endpoint
app.get('/api/randomdata', async (req, res) => {
    let db = await _db;
    
    let query = `
    INSERT INTO expenses (id, user_id, date, amount, description, category, payee)
    VALUES
    (?, ?, '2023-05-01', -25.50, 'Dinner with friends', 'Food', 'Esselunga'),
    (?, ?, '2023-05-03', -15.00, 'Bus ticket', 'Transportation', 'ATM'),
    (?, ?, '2023-05-05', -50.00, 'New shoes', 'Shopping', 'Footlocker'),
    (?, ?, '2023-05-07', -10.00, 'Movie ticket', 'Entertainment', 'Cinema'),
    (?, ?, '2023-05-10', -80.00, 'Electricity bill', 'Bills', 'Enel'),
    (?, ?, '2023-05-12', -30.00, 'Medicine', 'Health', 'Pharmacy'),
    (?, ?, '2023-05-15', -200.00, 'Flight ticket', 'Travel', 'Alitalia'),
    (?, ?, '2023-05-18', -150.00, 'Textbooks', 'Education', 'University Bookstore'),
    (?, ?, '2023-05-20', 500.00, 'Freelance work', 'Income', 'Client ABC'),
    (?, ?, '2023-05-25', 100.00, 'Birthday gift', 'Income', 'Friend XYZ'),
    (?, ?, '2023-05-02', -40.00, 'Lunch at a restaurant', 'Food', 'Ristorante XYZ'),
    (?, ?, '2023-05-04', -20.00, 'Taxi ride', 'Transportation', 'Taxi Company'),
    (?, ?, '2023-05-06', -100.00, 'New clothes', 'Shopping', 'H&M'),
    (?, ?, '2023-05-08', -15.00, 'Concert tickets', 'Entertainment', 'Ticketmaster'),
    (?, ?, '2023-05-11', -70.00, 'Internet bill', 'Bills', 'ISP Provider'),
    (?, ?, '2023-05-13', -40.00, 'Gym membership', 'Health', 'Fitness Club'),
    (?, ?, '2023-05-16', -250.00, 'Hotel booking', 'Travel', 'Hotel XYZ'),
    (?, ?, '2023-05-19', -80.00, 'Art supplies', 'Education', 'Art Store'),
    (?, ?, '2023-05-22', 300.00, 'Freelance work', 'Income', 'Client DEF'),
    (?, ?, '2023-05-28', 50.00, 'Selling old items', 'Income', 'Online Marketplace'),
    (?, ?, '2023-04-01', -30.00, 'Grocery shopping', 'Food', 'Esselunga'),
    (?, ?, '2023-04-03', -15.00, 'Bus fare', 'Transportation', 'ATM Milan'),
    (?, ?, '2023-04-05', -50.00, 'Clothing purchase', 'Shopping', 'H&M'),
    (?, ?, '2023-04-07', -25.00, 'Movie tickets', 'Entertainment', 'Cinema City'),
    (?, ?, '2023-04-09', -80.00, 'Electricity bill', 'Bills', 'Utility Company'),
    (?, ?, '2023-04-11', -40.00, 'Gym membership', 'Health', 'Fitness Center'),
    (?, ?, '2023-04-13', -200.00, 'Flight tickets', 'Travel', 'Airline XYZ'),
    (?, ?, '2023-04-15', -60.00, 'Textbook purchase', 'Education', 'University Bookstore'),
    (?, ?, '2023-04-17', -35.00, 'Dinner at a restaurant', 'Food', 'Ristorante ABC'),
    (?, ?, '2023-04-19', -20.00, 'Taxi ride', 'Transportation', 'Taxi Company'),
    (?, ?, '2023-04-21', -70.00, 'Online shopping', 'Shopping', 'Amazon'),
    (?, ?, '2023-04-23', -40.00, 'Concert tickets', 'Entertainment', 'Ticketmaster'),
    (?, ?, '2023-04-25', -90.00, 'Mobile phone bill', 'Bills', 'Mobile Service Provider'),
    (?, ?, '2023-04-27', -50.00, 'Fitness class', 'Health', 'Fitness Studio'),
    (?, ?, '2023-04-29', -150.00, 'Hotel booking', 'Travel', 'Hotel XYZ'),
    (?, ?, '2023-04-02', 500.00, 'Freelance work', 'Income', 'Client ABC'),
    (?, ?, '2023-04-04', 100.00, 'Selling old items', 'Income', 'Online Marketplace'),
    (?, ?, '2023-04-06', 200.00, 'Freelance work', 'Income', 'Client DEF'),
    (?, ?, '2023-04-08', 50.00, 'Part-time job', 'Income', 'Company XYZ'),
    (?, ?, '2023-04-10', 300.00, 'Selling artwork', 'Income', 'Art Gallery'),
    (?, ?, '2023-04-12', 150.00, 'Freelance work', 'Income', 'Client GHI'),
    (?, ?, '2023-03-01', -30.00, 'Grocery shopping', 'Food', 'Esselunga'),
    (?, ?, '2023-03-03', -15.00, 'Bus fare', 'Transportation', 'ATM Milan'),
    (?, ?, '2023-03-05', -50.00, 'Clothing purchase', 'Shopping', 'H&M'),
    (?, ?, '2023-03-07', -25.00, 'Movie tickets', 'Entertainment', 'Cinema City'),
    (?, ?, '2023-03-09', -80.00, 'Electricity bill', 'Bills', 'Utility Company'),
    (?, ?, '2023-03-11', -40.00, 'Gym membership', 'Health', 'Fitness Center'),
    (?, ?, '2023-03-13', -200.00, 'Flight tickets', 'Travel', 'Airline XYZ'),
    (?, ?, '2023-03-15', -60.00, 'Textbook purchase', 'Education', 'University Bookstore'),
    (?, ?, '2023-03-17', -35.00, 'Dinner at a restaurant', 'Food', 'Ristorante ABC'),
    (?, ?, '2023-03-19', -20.00, 'Taxi ride', 'Transportation', 'Taxi Company'),
    (?, ?, '2023-03-21', -70.00, 'Online shopping', 'Shopping', 'Amazon'),
    (?, ?, '2023-03-23', -40.00, 'Concert tickets', 'Entertainment', 'Ticketmaster'),
    (?, ?, '2023-03-25', -90.00, 'Mobile phone bill', 'Bills', 'Mobile Service Provider'),
    (?, ?, '2023-03-27', -50.00, 'Fitness class', 'Health', 'Fitness Studio'),
    (?, ?, '2023-03-29', -150.00, 'Hotel booking', 'Travel', 'Hotel XYZ'),
    (?, ?, '2023-03-02', 500.00, 'Freelance work', 'Income', 'Client ABC'),
    (?, ?, '2023-03-04', 100.00, 'Selling old items', 'Income', 'Online Marketplace'),
    (?, ?, '2023-03-06', 200.00, 'Freelance work', 'Income', 'Client DEF'),
    (?, ?, '2023-03-08', 50.00, 'Part-time job', 'Income', 'Company XYZ'),
    (?, ?, '2023-03-10', 300.00, 'Selling artwork', 'Income', 'Art Gallery');
    `;

    const user_id = req.user.id;

    // create 60 random ids for the transactions
    const ids = [];
    for (let i = 0; i < 61; i++) {
        let id = 'tr' + crypto.createHash('sha256').update(`${user_id}${crypto.randomUUID()}`).digest('hex');
        ids.push(id);
    }

    // generate array where every even element is an id and every odd element is the user_id
    const id_user_id = [];
    for (let i = 0; i < 122; i = i + 2) {
        id_user_id.push(ids[Math.ceil(i/2)]);
        id_user_id.push(user_id);
    }

    // sqlite3 execute query
    db.run(query, id_user_id);


    // send response
    res.status(200).json({
        status: 'success',
        data: {
            message: 'Transactions created successfully'
        }
    });
});