const Database = require('../classes/database');
const _db = new Database();

const express = require('express');
const router = express.Router();

const crypto = require('crypto');

// randomdata endpoint
router.get('/randomdata', async (req, res) => {
    let db = await _db;

    const user_id = req.user.id;

    // check that there is no expense for this user that starts with trrandom
    const existingRandomData = await db.get('SELECT id FROM expenses WHERE user_id = ? AND id LIKE "trrandom%"', user_id);

    if (existingRandomData) {
        return res.status(500).json({ error: 'Random data already exists' });
    }


    let query = `
    INSERT INTO expenses (id, user_id, date, amount, description, category, payee)
    VALUES
    (?, ?, '2023-05-01T18:00', -25.50, 'Dinner with friends (Random)', 'Food', 'Esselunga'),
    (?, ?, '2023-05-03T18:00', -15.00, 'Bus ticket (Random)', 'Transportation', 'ATM'),
    (?, ?, '2023-05-05T18:00', -50.00, 'New shoes (Random)', 'Shopping', 'Footlocker'),
    (?, ?, '2023-05-07T18:00', -10.00, 'Movie ticket (Random)', 'Entertainment', 'Cinema'),
    (?, ?, '2023-05-10T18:00', -80.00, 'Electricity bill (Random)', 'Bills', 'Enel'),
    (?, ?, '2023-05-12T18:00', -30.00, 'Medicine (Random)', 'Health', 'Pharmacy'),
    (?, ?, '2023-05-15T18:00', -200.00, 'Flight ticket (Random)', 'Travel', 'Alitalia'),
    (?, ?, '2023-05-18T18:00', -150.00, 'Textbooks (Random)', 'Education', 'University Bookstore'),
    (?, ?, '2023-05-20T18:00', 500.00, 'Freelance work (Random)', 'Income', 'Client ABC'),
    (?, ?, '2023-05-25T18:00', 100.00, 'Birthday gift (Random)', 'Income', 'Friend XYZ'),
    (?, ?, '2023-05-02T18:00', -40.00, 'Lunch at a restaurant (Random)', 'Food', 'Ristorante XYZ'),
    (?, ?, '2023-05-04T18:00', -20.00, 'Taxi ride (Random)', 'Transportation', 'Taxi Company'),
    (?, ?, '2023-05-06T18:00', -100.00, 'New clothes (Random)', 'Shopping', 'H&M'),
    (?, ?, '2023-05-08T18:00', -15.00, 'Concert tickets (Random)', 'Entertainment', 'Ticketmaster'),
    (?, ?, '2023-05-11T18:00', -70.00, 'Internet bill (Random)', 'Bills', 'ISP Provider'),
    (?, ?, '2023-05-13T18:00', -40.00, 'Gym membership (Random)', 'Health', 'Fitness Club'),
    (?, ?, '2023-05-16T18:00', -250.00, 'Hotel booking (Random)', 'Travel', 'Hotel XYZ'),
    (?, ?, '2023-05-19T18:00', -80.00, 'Art supplies (Random)', 'Education', 'Art Store'),
    (?, ?, '2023-05-22T18:00', 300.00, 'Freelance work (Random)', 'Income', 'Client DEF'),
    (?, ?, '2023-05-28T18:00', 50.00, 'Selling old items (Random)', 'Income', 'Online Marketplace'),
    (?, ?, '2023-04-01T18:00', -30.00, 'Grocery shopping (Random)', 'Food', 'Esselunga'),
    (?, ?, '2023-04-03T18:00', -15.00, 'Bus fare (Random)', 'Transportation', 'ATM Milan'),
    (?, ?, '2023-04-05T18:00', -50.00, 'Clothing purchase (Random)', 'Shopping', 'H&M'),
    (?, ?, '2023-04-07T18:00', -25.00, 'Movie tickets (Random)', 'Entertainment', 'Cinema City'),
    (?, ?, '2023-04-09T18:00', -80.00, 'Electricity bill (Random)', 'Bills', 'Utility Company'),
    (?, ?, '2023-04-11T18:00', -40.00, 'Gym membership (Random)', 'Health', 'Fitness Center'),
    (?, ?, '2023-04-13T18:00', -200.00, 'Flight tickets (Random)', 'Travel', 'Airline XYZ'),
    (?, ?, '2023-04-15T18:00', -60.00, 'Textbook purchase (Random)', 'Education', 'University Bookstore'),
    (?, ?, '2023-04-17T18:00', -35.00, 'Dinner at a restaurant (Random)', 'Food', 'Ristorante ABC'),
    (?, ?, '2023-04-19T18:00', -20.00, 'Taxi ride (Random)', 'Transportation', 'Taxi Company'),
    (?, ?, '2023-04-21T18:00', -70.00, 'Online shopping (Random)', 'Shopping', 'Amazon'),
    (?, ?, '2023-04-23T18:00', -40.00, 'Concert tickets (Random)', 'Entertainment', 'Ticketmaster'),
    (?, ?, '2023-04-25T18:00', -90.00, 'Mobile phone bill (Random)', 'Bills', 'Mobile Service Provider'),
    (?, ?, '2023-04-27T18:00', -50.00, 'Fitness class (Random)', 'Health', 'Fitness Studio'),
    (?, ?, '2023-04-29T18:00', -150.00, 'Hotel booking (Random)', 'Travel', 'Hotel XYZ'),
    (?, ?, '2023-04-02T18:00', 500.00, 'Freelance work (Random)', 'Income', 'Client ABC'),
    (?, ?, '2023-04-04T18:00', 100.00, 'Selling old items (Random)', 'Income', 'Online Marketplace'),
    (?, ?, '2023-04-06T18:00', 200.00, 'Freelance work (Random)', 'Income', 'Client DEF'),
    (?, ?, '2023-04-08T18:00', 50.00, 'Part-time job (Random)', 'Income', 'Company XYZ'),
    (?, ?, '2023-04-10T18:00', 300.00, 'Selling artwork (Random)', 'Income', 'Art Gallery'),
    (?, ?, '2023-04-12T18:00', 150.00, 'Freelance work (Random)', 'Income', 'Client GHI'),
    (?, ?, '2023-03-01T18:00', -30.00, 'Grocery shopping (Random)', 'Food', 'Esselunga'),
    (?, ?, '2023-03-03T18:00', -15.00, 'Bus fare', 'Transportation (Random)', 'ATM Milan'),
    (?, ?, '2023-03-05T18:00', -50.00, 'Clothing purchase (Random)', 'Shopping', 'H&M'),
    (?, ?, '2023-03-07T18:00', -25.00, 'Movie tickets (Random)', 'Entertainment', 'Cinema City'),
    (?, ?, '2023-03-09T18:00', -80.00, 'Electricity bill (Random)', 'Bills', 'Utility Company'),
    (?, ?, '2023-03-11T18:00', -40.00, 'Gym membership (Random)', 'Health', 'Fitness Center'),
    (?, ?, '2023-03-13T18:00', -200.00, 'Flight tickets (Random)', 'Travel', 'Airline XYZ'),
    (?, ?, '2023-03-15T18:00', -60.00, 'Textbook purchase (Random)', 'Education', 'University Bookstore'),
    (?, ?, '2023-03-17T18:00', -35.00, 'Dinner at a restaurant (Random)', 'Food', 'Ristorante ABC'),
    (?, ?, '2023-03-19T18:00', -20.00, 'Taxi ride (Random)', 'Transportation', 'Taxi Company'),
    (?, ?, '2023-03-21T18:00', -70.00, 'Online shopping (Random)', 'Shopping', 'Amazon'),
    (?, ?, '2023-03-23T18:00', -40.00, 'Concert tickets (Random)', 'Entertainment', 'Ticketmaster'),
    (?, ?, '2023-03-25T18:00', -90.00, 'Mobile phone bill (Random)', 'Bills', 'Mobile Service Provider'),
    (?, ?, '2023-03-27T18:00', -50.00, 'Fitness class (Random)', 'Health', 'Fitness Studio'),
    (?, ?, '2023-03-29T18:00', -150.00, 'Hotel booking (Random)', 'Travel', 'Hotel XYZ'),
    (?, ?, '2023-03-02T18:00', 500.00, 'Freelance work (Random)', 'Income', 'Client ABC'),
    (?, ?, '2023-03-04T18:00', 100.00, 'Selling old items (Random)', 'Income', 'Online Marketplace'),
    (?, ?, '2023-03-06T18:00', 200.00, 'Freelance work (Random)', 'Income', 'Client DEF'),
    (?, ?, '2023-03-08T18:00', 50.00, 'Part-time job (Random)', 'Income', 'Company XYZ'),
    (?, ?, '2023-03-10T18:00', 300.00, 'Selling artwork (Random)', 'Income', 'Art Gallery');
    `;

    // create 60 random ids for the transactions
    const ids = [];
    for (let i = 0; i < 61; i++) {
        let id = 'trrandom' + crypto.createHash('sha256').update(`${user_id}${crypto.randomUUID()}`).digest('hex');
        ids.push(id);
    }

    // generate array where every even element is an id and every odd element is the user_id
    const id_user_id = [];
    for (let i = 0; i < 122; i = i + 2) {
        id_user_id.push(ids[Math.ceil(i / 2)]);
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

module.exports = router;