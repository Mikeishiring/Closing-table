import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// In-memory Offer Store
// -----------------------------
const offers = new Map(); // offerId -> { max, email, createdAt, used, expiresAt }
const OFFER_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours

// -----------------------------
// Express App
// -----------------------------
const app = express();
app.use(express.json());
app.use(express.static("."));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  })
);

// -----------------------------
// Helpers
// -----------------------------
function generateId() {
  return Math.random().toString(36).substring(2, 12);
}

function roundToK(value) {
  return Math.round(value / 1000) * 1000;
}

// -----------------------------
// API ENDPOINTS
// -----------------------------

// 1. Create offer (company)
app.post("/api/offers", (req, res) => {
  const { max, email } = req.body;

  if (!max || typeof max !== "number") {
    return res.status(400).json({ error: "Invalid max number" });
  }

  const id = generateId();
  const offer = {
    max,
    email: email || null,
    createdAt: Date.now(),
    used: false,
    expiresAt: Date.now() + OFFER_TTL_MS,
  };

  offers.set(id, offer);

  res.json({ offerId: id });
});

// 2. Validate offer (candidate loads link)
app.get("/api/offers/:id", (req, res) => {
  const offer = offers.get(req.params.id);

  if (!offer) return res.json({ status: "invalid" });
  if (Date.now() > offer.expiresAt) return res.json({ status: "expired" });
  if (offer.used) return res.json({ status: "used" });

  res.json({
    status: "ok",
    max: offer.max,
  });
});

// 3. Submit candidate minimum
app.post("/api/offers/:id/submit", (req, res) => {
  const offer = offers.get(req.params.id);
  if (!offer) return res.json({ status: "invalid" });

  if (Date.now() > offer.expiresAt)
    return res.json({ status: "expired" });

  if (offer.used)
    return res.json({ status: "used" });

  const { min, email } = req.body;

  if (!min || typeof min !== "number") {
    return res.status(400).json({ error: "Invalid minimum number" });
  }

  const cMax = offer.max;
  const cMin = min;

  let outcome;

  if (cMin <= cMax) {
    const surplus = cMax - cMin;
    const raw = cMin + surplus / 2;
    const final = roundToK(raw);
    outcome = { status: "success", final, surplus };
  } else if (cMin <= cMax * 1.1) {
    const gap = cMin - cMax;
    outcome = { status: "close", gap };
  } else {
    const gap = cMin - cMax;
    outcome = { status: "fail", gap };
  }

  offer.used = true; // one-shot

  res.json(outcome);
});

// Serve index.html for all other routes (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// -----------------------------
// Server Start
// -----------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Closing Table backend running on port", PORT);
});
