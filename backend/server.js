import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory offer store
const offers = new Map();

// Config
const OFFER_TTL_MS = 1000 * 60 * 60; // 1 hour
const BRIDGE_ZONE_MULTIPLIER = 1.1; // 10% above max is "close"
const ROUNDING_GRANULARITY = 1000; // Round to nearest $1,000

// Cleanup loop (every 15 mins)
setInterval(() => {
  const now = Date.now();
  for (const [id, offer] of offers.entries()) {
    if (now > offer.expiresAt || offer.used) {
      offers.delete(id);
    }
  }
}, 1000 * 60 * 15);

/**
 * Computes the negotiation outcome based on company max and candidate min.
 * @param {number} max - Company's maximum offer
 * @param {number} min - Candidate's minimum requirement
 * @returns {Object} Outcome with status, and optional final/surplus/gap
 */
function computeOutcome(max, min) {
  if (min <= max) {
    // Success: Overlap found. Split the difference.
    const surplus = max - min;
    const raw = min + surplus / 2;
    const final = Math.round(raw / ROUNDING_GRANULARITY) * ROUNDING_GRANULARITY;
    return { status: "success", final, surplus };
  }

  if (min <= max * BRIDGE_ZONE_MULTIPLIER) {
    // Close: Within 10% bridge zone
    const gap = min - max;
    return { status: "close", gap };
  }

  // Fail: Gap too large (>10%)
  const gap = min - max;
  return { status: "fail", gap };
}

/**
 * Validates that a value is a valid positive number within reasonable bounds.
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {boolean} True if valid
 */
function isValidSalary(value, fieldName) {
  if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
    return false;
  }
  // Reasonable bounds: $1,000 to $10,000,000
  return value >= 1000 && value <= 10000000;
}

/**
 * Validates email is a string or null/undefined.
 * @param {*} email - Email value to validate
 * @returns {boolean} True if valid (string or null/undefined)
 */
function isValidEmail(email) {
  return email === null || email === undefined || typeof email === "string";
}

// Error handler for JSON parsing failures
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  next(err);
});

app.post("/api/offers", (req, res) => {
  const { max, email } = req.body;

  // Input validation
  if (!isValidSalary(max, "max")) {
    return res.status(400).json({ error: "Invalid max: must be a number between $1,000 and $10,000,000" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email: must be a string or omitted" });
  }

  const id = Math.random().toString(36).slice(2);

  offers.set(id, {
    max,
    email: email || null,
    createdAt: Date.now(),
    expiresAt: Date.now() + OFFER_TTL_MS,
    used: false
  });

  res.json({ offerId: id });
});

app.get("/api/offers/:id", (req, res) => {
  const offer = offers.get(req.params.id);
  if (!offer) return res.json({ status: "invalid" });
  if (offer.used) return res.json({ status: "used" });
  if (Date.now() > offer.expiresAt) return res.json({ status: "expired" });

  res.json({ status: "ok" });
});

app.post("/api/offers/:id/submit", (req, res) => {
  const offer = offers.get(req.params.id);
  if (!offer) return res.json({ status: "invalid" });

  // Check expiration (consistent with GET endpoint)
  if (Date.now() > offer.expiresAt) {
    return res.json({ status: "expired" });
  }

  if (offer.used) {
    return res.json({ status: "used" });
  }

  const { min, email } = req.body;

  // Input validation
  if (!isValidSalary(min, "min")) {
    return res.status(400).json({ error: "Invalid min: must be a number between $1,000 and $10,000,000" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email: must be a string or omitted" });
  }

  // Mark as used before computing outcome (prevents race conditions)
  offer.used = true;

  // Compute outcome using extracted helper
  const outcome = computeOutcome(offer.max, min);

  res.json(outcome);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
