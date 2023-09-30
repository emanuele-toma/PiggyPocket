const Database = require('../classes/database');
const _db = new Database();

const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');
const crypto = require('crypto');

// get data for single report
router.get('/reports/@me/:yearmonth', async (req, res) => {
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
router.post('/reports/@me/:yearmonth', async (req, res) => {
    const db = await _db;
    const userId = req.user.id;

    const year = req.params.yearmonth.split('-')[0];
    const month = req.params.yearmonth.split('-')[1];

    // check if a report already exists for this month
    const existingReport = await db.get('SELECT id FROM reports WHERE user_id = ? AND year = ? AND month = ?', userId, year, month);

    let prompt = `Imagine you're a financial advisor, help this user based on his expenses, give specific advice only for these expenses, the user cannot reply to you. Reply in english. Do not use markdown in your reply. Every amount is in euros. ${req.user.name}: Please give me a feedback on how to improve my finance, these are my expenses for this month ${month}/${year}: `;

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

module.exports = router;