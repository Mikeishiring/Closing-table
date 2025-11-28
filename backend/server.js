import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory offer store
const offers = new Map();

// Config
const OFFER_TTL_MS = 1000 * 60 * 60; // 1 hour

// Cleanup loop (every 15 mins)
setInterval(() => {
  const now = Date.now();
  for (const [id, offer] of offers.entries()) {
    if (now > offer.expiresAt || offer.used) {
      offers.delete(id);
    }
  }
}, 1000 * 60 * 15);

app.post("/api/offers", (req, res) => {
  const { max, email } = req.body;
  const id = Math.random().toString(36).slice(2);

  offers.set(id, {
    max,
    email,
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

  const { min, email } = req.body;
  const max = offer.max;

  if (min <= max) {
    const surplus = max - min;
    const final = Math.round((min + surplus / 2) / 1000) * 1000;

    offer.used = true;

    res.json({ status: "success", final, surplus });
    return;
  }

  if (min <= max * 1.1) {
    res.json({ status: "close", gap: min - max });
    return;
  }

  res.json({ status: "fail", gap: min - max });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

