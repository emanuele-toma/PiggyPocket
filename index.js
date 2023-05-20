// Initialize env
require('dotenv').config();

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
    await db.run('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, picture TEXT)');
    await db.run('CREATE UNIQUE INDEX IF NOT EXISTS email ON users (email)');

    // Table expenses
    // id: INTEGER
    // user_id: TEXT
    // date: TEXT
    // amount: REAL
    // description: TEXT
    // category: TEXT
    await db.run('CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, date TEXT, amount REAL, description TEXT, category TEXT, payee TEXT)');
    await db.run('CREATE INDEX IF NOT EXISTS user_id ON expenses (user_id)');


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
    callbackURL: 'http://localhost/auth/google/callback'
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
app.use('/api', auth, express.json());

// Get /api/users/@me
app.get('/api/users/@me', async (req, res) => {
    const db = await _db;
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
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
        } else
        {
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
        filters.push('description LIKE ? OR payee LIKE ?');
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
        "ItaliaOnline",
        "Mediaset",
        "Rai",
        "La Repubblica",
        "Corriere della Sera",
        "Privalia",
        "Sephora",
        "Ikea",
        "Euronics",
        "Expert",
        "Unieuro",
        "Volotea",
        "Blablacar",
        "LinkedIn",
        "Uber Eats",
        "Subito.it",
        "Groupon",
        "Groupama Assicurazioni",
        "Allianz",
        "Generali",
        "Satispay",
        "Fineco Bank",
        "Banco BPM",
        "Intesa Sanpaolo",
        "UniCredit",
        "Mediolanum",
        "Banco Posta",
        "Sisal",
        "Lottomatica",
        "SuperEnalotto",
        "Snai",
        "Gazzetta dello Sport",
        "Il Sole 24 Ore",
        "Trenord",
        "Illy",
        "MSC Crociere",
        "Costa Crociere",
        "FlixBus",
        "GoOpti",
        "Trenitalia",
        "PostePay",
        "N26",
        "WINDTRE",
        "Fastweb",
        "Telepass",
        "Eni gas e luce",
        "Iliad",
        "Tre",
        "Wind",
        "Fastweb",
        "Lottomatica",
        "SuperEnalotto",
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
    const sql = 'INSERT INTO expenses (user_id, payee, category, description, amount, date) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [user_id, payee, category, description, amount, date];
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