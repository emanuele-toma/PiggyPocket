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
app.get('/home', auth, (req, res, next) => {
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


// Api

// Protect api routes
app.use('/api', auth, express.json());

// Get /api/users/@me
app.get('/api/users/@me', async (req, res) => {
    const db = await _db;
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
    res.json(user);
});

app.get('/api/expenses/@me', async (req, res) => {
    const db = await _db;
    const expenses = await db.all('SELECT * FROM expenses WHERE user_id = ?', req.user.id);
    res.json(expenses);
});

// get /api/image/:id
app.get('/api/payees/:id', async (req, res) => {
    // check if file exists in folder /assets/payees/:id, ignore extension, if exists send it, else send default image
    const fs = require('fs');
    const path = require('path');
    let payee = req.params.id;
    const dir = path.join(__dirname, 'public/assets/payees');
    const files = fs.readdirSync(dir);
    if (files.length > 0) {
        // replace spaces with underscores
        payee = payee.replace(/\s/g, '_').toLowerCase();

        const file = files.find(f => f.split('.')[0].toLowerCase() == payee);

        if (file) {
            res.sendFile(path.join(__dirname, `public/assets/payees/${file}.png`));
        } else {
            res.sendFile(path.join(__dirname, 'public/assets/payees/default.png'));
        }
    } else {
        res.sendFile(path.join(__dirname, 'public/assets/payees/default.png'));
    }
});