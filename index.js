// Initialize env
require('dotenv').config();

// Use exec
const exec = require('child_process').exec;

// Use fs
const fs = require('fs');

// Use node-fetch
const fetch = require('node-fetch');

// Use crypto
const crypto = require('crypto');

// Express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Use compression
const compression = require('compression');
app.use(compression());

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

// Load routers from folder ./api where each file is a router
fs.readdirSync('./api').forEach(file => {
    const router = require(`./api/${file}`);
    app.use('/api', router);
});

// Webhook for Github
app.post('/webhook/github', express.json(), (req, res) => {
    const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);

    hmac.update(JSON.stringify(req.body));
    const digest = hmac.digest('hex');
    const checksum = req.headers['x-hub-signature-256'];

    if (!checksum || !digest || checksum !== `sha256=${digest}`) {
        res.status(403).send('Unauthorized');
        return;
    }
    
    const pull = exec('git pull');
    pull.on('close', (code) => {
        if (code !== 0) {
            console.log(`git pull exited with code ${code}`);
        }

        // run npm install
        const npmInstall = exec('npm install');
        npmInstall.on('close', (code) => {
            if (code !== 0) {
                console.log(`npm install exited with code ${code}`);
            }

            // send response
            res.status(200).json({
                status: 'success',
                data: {
                    message: 'Pull successful'
                }
            });

            // exit process
            process.exit(0);
        });
    });

});