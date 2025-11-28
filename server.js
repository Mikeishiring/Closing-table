const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory store: Map<offerId, Offer>
const offers = new Map();

// Cleanup expired offers every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [offerId, offer] of offers.entries()) {
        if (offer.expiresAt < now) {
            offers.delete(offerId);
        }
    }
}, 5 * 60 * 1000);

// POST /api/offers - Create a new offer
app.post('/api/offers', (req, res) => {
    const { max, email } = req.body;

    // Validation
    if (typeof max !== 'number' || max <= 0 || max > 10000000) {
        return res.status(400).json({ 
            error: 'Invalid max: must be a positive number less than 10,000,000' 
        });
    }

    if (email && typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create offer
    const offerId = uuidv4();
    const now = Date.now();
    const offer = {
        max,
        email: email || null,
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
        used: false,
    };

    offers.set(offerId, offer);

    res.json({ offerId });
});

// GET /api/offers/:offerId - Check offer status
app.get('/api/offers/:offerId', (req, res) => {
    const { offerId } = req.params;
    const offer = offers.get(offerId);

    if (!offer) {
        return res.json({ status: 'invalid' });
    }

    const now = Date.now();
    if (offer.expiresAt < now) {
        offers.delete(offerId);
        return res.json({ status: 'expired' });
    }

    if (offer.used) {
        return res.json({ status: 'used' });
    }

    res.json({ status: 'ok' });
});

// POST /api/offers/:offerId/submit - Submit candidate's minimum and run mechanism
app.post('/api/offers/:offerId/submit', (req, res) => {
    const { offerId } = req.params;
    const { min, email } = req.body;

    // Validation
    if (typeof min !== 'number' || min <= 0) {
        return res.status(400).json({ error: 'Invalid min: must be a positive number' });
    }

    // Look up offer
    const offer = offers.get(offerId);
    if (!offer) {
        return res.json({ status: 'invalid' });
    }

    const now = Date.now();
    if (offer.expiresAt < now) {
        offers.delete(offerId);
        return res.json({ status: 'expired' });
    }

    if (offer.used) {
        return res.json({ status: 'used' });
    }

    // Run the mechanism
    const cMax = offer.max;
    const cMin = min;
    const BRIDGE_ZONE_PCT = 0.10;
    const ROUNDING_GRANULARITY = 1000;

    let result;
    let surplus = null;
    let gap = null;

    if (cMin <= cMax) {
        // Success: Overlap found. Split the difference.
        surplus = cMax - cMin;
        const rawFinal = cMin + (surplus / 2);
        const final = Math.round(rawFinal / ROUNDING_GRANULARITY) * ROUNDING_GRANULARITY;
        result = { status: 'success', final, surplus };
    } else if (cMin <= cMax * (1 + BRIDGE_ZONE_PCT)) {
        // Close failure: within bridge zone -> Recommendation to Talk
        gap = cMin - cMax;
        result = { status: 'close', gap };
    } else {
        // Hard failure
        gap = cMin - cMax;
        result = { status: 'fail', gap };
    }

    // Mark offer as used
    offer.used = true;

    res.json(result);
});

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Closing Table server running on http://localhost:${PORT}`);
});

