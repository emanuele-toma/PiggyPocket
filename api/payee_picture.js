const express = require('express');
const router = express.Router();

// get /api/image/:id
router.get('/payee_picture/:id', async (req, res) => {
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

module.exports = router;