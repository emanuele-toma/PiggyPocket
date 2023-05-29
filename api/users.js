const Database = require('../classes/database');
const _db = new Database();

const express = require('express');
const router = express.Router();

router.get('/users/@me', async (req, res) => {
    const db = await _db;
    const user = await db.get('SELECT id, name, email, picture FROM users WHERE id = ?', req.user.id);
    res.json(user);
});

module.exports = router;