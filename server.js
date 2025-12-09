const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://unpkg.com",
        "https://cdn.tailwindcss.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://grainy-gradients.vercel.app"
      ],
      connectSrc: [
        "'self'"
      ]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// --- CONSTANTS ---
const OFFER_TTL_MS = 24 * 60 * 60 * 1000;       // 24h offers
const RESULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;  // 7d results
const BRIDGE_ZONE_PCT = 0.10;                   // 10% bridge zone
const ROUNDING_GRANULARITY = 1000;              // $1,000 rounding
const TOTAL_MIN = 50_000;                       // Align with frontend limits
const TOTAL_MAX = 500_000;

// --- IN-MEMORY STORES ---
/**
 * OFFERS MAP - Ephemeral, single-use storage
 * 
 * Retention policy:
 * - Offers are IMMEDIATELY DELETED after first use (success, close, or fail)
 * - Offers are also automatically deleted after OFFER_TTL_MS (24 hours) expires
 * - No sensitive data beyond the single max value is retained after the mechanism runs
 * - This ensures "single-use, outcome-only" behavior
 * 
 * Keys: offerId -> { max, createdAt, expiresAt }
 * Note: We only store the minimum needed to run the mechanism once
 */
const offers = new Map();

/**
 * RESULTS MAP - Outcome-only storage
 * 
 * Retention policy:
 * - Results store ONLY the outcome: status, final number, suggested (for close), and timestamp
 * - NO original inputs (company max, candidate min, emails) are ever stored here
 * - Results are automatically deleted after RESULT_TTL_MS (7 days)
 * - This ensures privacy: only "did it work?" and "what's the number?" are retained
 * 
 * Keys: resultId -> { status, final, suggested, createdAt }
 */
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

// --- PURE MECHANISM CALCULATION ---
/**
 * Pure function to calculate deal outcome from CMax and CMin
 * @param {number} cMax - Company's maximum offer (total compensation)
 * @param {number} cMin - Candidate's minimum requirement (total compensation)
 * @returns {Object} Result object with status, final, surplus/gap, and suggested (for close state)
 */
function calculateDeal(cMax, cMin) {
  if (typeof cMax !== 'number' || !Number.isFinite(cMax) || cMax <= 0) {
    throw new Error('Invalid cMax: must be a positive finite number');
  }
  if (typeof cMin !== 'number' || !Number.isFinite(cMin) || cMin <= 0) {
    throw new Error('Invalid cMin: must be a positive finite number');
  }

  // FAIR_SPLIT: Overlap case (cMin <= cMax)
  if (cMin <= cMax) {
    const surplus = cMax - cMin;
    const rawFinal = cMin + surplus / 2;
    const final = roundToGranularity(rawFinal);
    return {
      status: 'success', // FAIR_SPLIT
      final,
      surplus,
      gap: null,
      suggested: null,
    };
  }

  // Gap case: cMin > cMax
  const gap = cMin - cMax;
  const gapPercent = (gap / cMax) * 100;
  const withinBridge = gapPercent <= (BRIDGE_ZONE_PCT * 100);

  if (withinBridge) {
    // BRIDGE_ZONE: Close enough for human negotiation
    // Compute a suggested starting point as the midpoint between cMax and cMin
    const rawSuggested = cMax + gap / 2; // Same as (cMax + cMin) / 2
    const suggested = roundToGranularity(rawSuggested);
    
    return {
      status: 'close', // BRIDGE_ZONE
      final: null,
      surplus: null,
      gap,
      suggested, // Non-binding starting point for human negotiation
    };
  }

  return {
    status: 'fail', // NO_DEAL
    final: null,
    surplus: null,
    gap,
    suggested: null,
  };
}

// Note: Email functionality removed. No email addresses are collected or stored.
// If email notifications are needed in the future, implement here with clear privacy documentation.

// --- SERVE STATIC FILES ---
// Serve built static files from the dist directory (faster than inline Babel)
app.use(express.static(path.join(__dirname, 'dist')));

// --- SERVE FRONTEND ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- HEALTHCHECK ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- CREATE OFFER ---
/**
 * Creates a new offer with the company's maximum total compensation.
 * 
 * Privacy note: We do NOT collect or store email addresses.
 * The offer stores only the minimum data needed to run the mechanism once:
 * - max: total compensation
 * - createdAt/expiresAt: for TTL enforcement
 * 
 * The offer is DELETED immediately after the mechanism runs.
 */
app.post('/api/offers', (req, res) => {
  const { max } = req.body || {};

  if (typeof max !== 'number' || !Number.isFinite(max) || max <= 0) {
    return res.status(400).json({ error: 'Invalid or missing "max"' });
  }

  if (max < TOTAL_MIN || max > TOTAL_MAX) {
    return res.status(400).json({ error: `"max" must be between ${TOTAL_MIN} and ${TOTAL_MAX}` });
  }

  const totalMax = max;
  const createdAt = Date.now();
  const expiresAt = createdAt + OFFER_TTL_MS;
  const offerId = generateId('o');

  // Store only the minimum data needed for single-use mechanism
  // Note: No email or compensation breakdown stored (only total max)
  offers.set(offerId, {
    max: totalMax, // Total compensation for mechanism
    createdAt,
    expiresAt,
  });

  console.log('[offer_created]', { 
    offerId,
    createdAt 
  });

  return res.json({ offerId });
});

// --- CHECK OFFER STATUS ---
app.get('/api/offers/:offerId', (req, res) => {
  const { offerId } = req.params;
  const offer = offers.get(offerId);

  // Offer not found = either invalid or already used (deleted after use)
  if (!offer) {
    return res.json({ status: 'invalid' });
  }

  // Check TTL expiration
  if (isExpired(offer.createdAt, OFFER_TTL_MS)) {
    offers.delete(offerId);
    return res.json({ status: 'expired' });
  }

  return res.json({ 
    status: 'ok',
  });
});

// --- SUBMIT CANDIDATE MIN & RUN MECHANISM ---
/**
 * Submits the candidate's minimum total compensation and runs the mechanism.
 * 
 * Privacy note: We do NOT collect or store email addresses.
 * The mechanism runs once, stores only the outcome, then IMMEDIATELY DELETES
 * the offer (including company max).
 * 
 * Result storage: Only status, final number, suggested (for close), and timestamp.
 */
app.post('/api/offers/:offerId/submit', async (req, res) => {
  const { offerId } = req.params;
  const { min } = req.body || {};

  if (typeof min !== 'number' || !Number.isFinite(min) || min <= 0) {
    return res.status(400).json({ error: 'Invalid or missing "min"' });
  }

  if (min < TOTAL_MIN || min > TOTAL_MAX) {
    return res.status(400).json({ error: `"min" must be between ${TOTAL_MIN} and ${TOTAL_MAX}` });
  }

  const offer = offers.get(offerId);

  // Offer not found = either invalid or already used (deleted after use)
  if (!offer) {
    return res.json({ status: 'invalid' });
  }

  // Check TTL expiration
  if (isExpired(offer.createdAt, OFFER_TTL_MS)) {
    offers.delete(offerId);
    return res.json({ status: 'expired' });
  }

  const cMax = offer.max;
  const cMin = min;

  // Run the mechanism (pure function)
  const dealResult = calculateDeal(cMax, cMin);
  const { status, final, suggested } = dealResult;

  // Store result snapshot for ALL outcomes (success, close, fail)
  // Note: We store ONLY outcome data, never original inputs
  const createdAt = Date.now();
  const resultId = generateId('r');

  results.set(resultId, {
    status,
    final: status === 'success' ? final : null,
    suggested: status === 'close' ? suggested : null, // Starting point for close state
    createdAt,
  });

  // IMMEDIATELY DELETE the offer after mechanism runs
  // This ensures no sensitive data (max or breakdown) is retained
  offers.delete(offerId);

  console.log('[offer_submitted]', {
    offerId,
    resultId,
    offerDeleted: true,
  });

  // Return result to candidate
  return res.json({
    status,
    final: status === 'success' ? final : null,
    suggested: status === 'close' ? suggested : null,
    resultId,
    createdAt,
  });
});

// --- REVEAL RESULT ---
/**
 * Returns the outcome of a completed mechanism run.
 * 
 * Response contains ONLY:
 * - status: "success" | "close" | "fail"
 * - final: number (for success) or null
 * - suggested: number (for close) or null - non-binding starting point
 * - createdAt: timestamp
 * 
 * NO original inputs (company max, candidate min, emails) are returned.
 */
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

  // Return outcome-only data
  return res.json({
    status: result.status,
    final: result.final || null,
    suggested: result.suggested || null,
    createdAt: result.createdAt,
  });
});

// Export for testing (before starting server)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateDeal,
    roundToGranularity,
    BRIDGE_ZONE_PCT,
    ROUNDING_GRANULARITY,
    app,
  };
}

// --- START SERVER ---
// Only start server if this file is run directly (not when required for tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Closing Table backend listening on port ${PORT}`);
  });
}
