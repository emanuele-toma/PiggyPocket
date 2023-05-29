const express = require('express');
const router = express.Router();

// get /api/payees/@me
router.get('/payees/@me', async (req, res) => {
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

module.exports = router;