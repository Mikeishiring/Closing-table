const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// --- CONSTANTS ---
const OFFER_TTL_MS = 24 * 60 * 60 * 1000;       // 24h offers
const RESULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;  // 7d results
const BRIDGE_ZONE_PCT = 0.10;                   // 10% bridge zone
const ROUNDING_GRANULARITY = 1000;              // $1,000 rounding

// --- IN-MEMORY STORES ---
// offerId -> { max, email, createdAt, expiresAt, used }
const offers = new Map();

// resultId -> { status, final, surplus, min, max, createdAt }
const results = new Map();

// --- HELPERS ---
function generateId(prefix = '') {
  const id = Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}_${id}` : id;
}

function isExpired(createdAt, ttlMs) {
  return Date.now() - createdAt > ttlMs;
}

function roundToGranularity(value) {
  return Math.round(value / ROUNDING_GRANULARITY) * ROUNDING_GRANULARITY;
}

async function sendResultEmail(email, revealLink, final) {
  const frontendBase = process.env.FRONTEND_BASE || 'https://closing-table.pages.dev';

  if (!email) {
    console.log(`[email stub] No email provided. Result link: ${revealLink} (final: ${final})`);
    return;
  }

  console.log(
    `[email stub] Would send email to ${email} with final ${final} and link: ${revealLink} (frontend: ${frontendBase})`
  );
}

// --- SERVE FRONTEND ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// --- HEALTHCHECK ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- CREATE OFFER ---
app.post('/api/offers', (req, res) => {
  const { max, email } = req.body || {};

  if (typeof max !== 'number' || !Number.isFinite(max) || max <= 0) {
    return res.status(400).json({ error: 'Invalid or missing "max"' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const createdAt = Date.now();
  const expiresAt = createdAt + OFFER_TTL_MS;
  const offerId = generateId('o');

  offers.set(offerId, {
    max,
    email,
    createdAt,
    expiresAt,
    used: false,
  });

  console.log('[offer_created]', { offerId, max, email, createdAt });

  return res.json({ offerId });
});

// --- CHECK OFFER STATUS ---
app.get('/api/offers/:offerId', (req, res) => {
  const { offerId } = req.params;
  const offer = offers.get(offerId);

  if (!offer) {
    return res.json({ status: 'invalid' });
  }

  if (isExpired(offer.createdAt, OFFER_TTL_MS)) {
    offers.delete(offerId);
    return res.json({ status: 'expired' });
  }

  if (offer.used) {
    return res.json({ status: 'used' });
  }

  // Frontend only cares that it's "ok"
  return res.json({ status: 'ok' });
});

// --- SUBMIT CANDIDATE MIN & RUN MECHANISM ---
app.post('/api/offers/:offerId/submit', async (req, res) => {
  const { offerId } = req.params;
  const { min, email } = req.body || {};

  if (typeof min !== 'number' || !Number.isFinite(min) || min <= 0) {
    return res.status(400).json({ error: 'Invalid or missing "min"' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const offer = offers.get(offerId);

  if (!offer) {
    return res.json({ status: 'invalid' });
  }

  if (isExpired(offer.createdAt, OFFER_TTL_MS)) {
    offers.delete(offerId);
    return res.json({ status: 'expired' });
  }

  if (offer.used) {
    return res.json({ status: 'used' });
  }

  const cMax = offer.max;
  const cMin = min;

  let status;
  let final = null;
  let surplus = null;
  let gap = null;
  let resultId = null;

  if (cMin <= cMax) {
    status = 'success';
    surplus = cMax - cMin;
    const rawFinal = cMin + surplus / 2;
    final = roundToGranularity(rawFinal);

    // Store result snapshot
    const createdAt = Date.now();
    resultId = generateId('r');

    results.set(resultId, {
      status,
      final,
      surplus,
      min: cMin,
      max: cMax,
      createdAt,
    });

    const frontendBase = process.env.FRONTEND_BASE || 'https://closing-table.pages.dev';
    const base = frontendBase.replace(/\/+$/, '');
    const revealLink = `${base}/#result=${encodeURIComponent(resultId)}`;

    try {
      await sendResultEmail(email, revealLink, final);
    } catch (err) {
      console.error('[sendResultEmail error]', err);
    }
  } else {
    gap = cMin - cMax;
    const withinBridge = gap <= cMax * BRIDGE_ZONE_PCT;
    status = withinBridge ? 'close' : 'fail';
  }

  // One shot: mark offer used regardless of status
  offer.used = true;

  console.log('[offer_submitted]', {
    offerId,
    min: cMin,
    email,
    status,
    surplus,
    gap,
    resultId,
  });

  return res.json({
    status,
    final,
    surplus,
    gap,
    resultId,
  });
});

// --- REVEAL RESULT ---
app.get('/api/results/:resultId', (req, res) => {
  const { resultId } = req.params;
  const result = results.get(resultId);

  if (!result) {
    return res.json({ status: 'invalid' });
  }

  if (isExpired(result.createdAt, RESULT_TTL_MS)) {
    results.delete(resultId);
    return res.json({ status: 'expired' });
  }

  return res.json({
    status: result.status,
    final: result.final,
    surplus: result.surplus,
    min: result.min,
    max: result.max,
    createdAt: result.createdAt,
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Closing Table backend listening on port ${PORT}`);
});
