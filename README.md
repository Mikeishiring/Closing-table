# The Closing Table

The Closing Table is a web application that implements a **single-shot compensation negotiation mechanism**. It's designed to simplify negotiations by having both parties submit their numbers once, then automatically computing a fair outcome if ranges overlap.

## What This Project Is About

The Closing Table addresses a fundamental problem in compensation negotiations: **back-and-forth haggling and negotiation fatigue**. Traditional negotiations often involve multiple rounds where neither party reveals their true limits, leading to inefficient outcomes and potential deal failures.

**The core idea:**
> Company sets its maximum **total compensation** (one all-in yearly number).  
> Candidate sets their minimum **total compensation** (one all-in yearly number).  
> If the ranges overlap, the app instantly closes a fair deal by splitting the difference 50/50.  
> If they don't overlap, the app clearly signals whether a human conversation could bridge the gap.

**Note on total compensation:** Both parties enter a single, all-inclusive total compensation number. The mechanism runs on that one figure—no breakdowns or extra components.

This is a **prototype** to explore fair, transparent negotiation mechanisms — not a production compensation tool.

---

## How It Works

The mechanism operates on a simple mathematical principle: when two parties' acceptable ranges overlap, there's a "surplus" that can be split fairly. The app ensures neither party goes below their minimum or above their maximum.

### The Mechanism (Mathematical Definition)

**Inputs:**
- `CMax`: Company's true maximum **total compensation** (single, all-in number; private, submitted first)
- `CMin`: Candidate's true minimum **total compensation** (single, all-in number; private, submitted second)

**Calculation:**
1. **FAIR_SPLIT (Overlap Case):** If `CMin ≤ CMax`
   - Surplus = `CMax - CMin`
   - Final Offer = `CMin + (Surplus / 2)`
   - Final Offer is rounded to the nearest $1,000
   - Status: `success`

2. **BRIDGE_ZONE (Close Gap):** If `CMin > CMax` and `(CMin - CMax) / CMax ≤ 0.10`
   - Gap = `CMin - CMax`
   - Gap is within 10% of company's maximum
   - Suggested starting point = `(CMax + CMin) / 2` (midpoint, for human negotiation)
   - Status: `close` (suggests human conversation)

3. **NO_DEAL (Large Gap):** If `CMin > CMax` and `(CMin - CMax) / CMax > 0.10`
   - Gap = `CMin - CMax`
   - Gap exceeds 10% threshold
   - Status: `fail` (deal cannot be closed)

**Key Properties:**
- **Total compensation:** The mechanism evaluates the complete package as one all-in number, not just base salary
- **Single-shot submission:** Each party inputs their total compensation as a single combined number
- **Single-use:** Each offer can only be submitted once, then immediately deleted from memory
- **Fair split:** When overlap exists, surplus is divided exactly 50/50
- **Outcome-only display:** Only the final outcome (deal/no deal/close) and final number are shown
- **Rounding:** Final offers are rounded to nearest $1,000 for simplicity
- **Privacy:** No email addresses are collected; offers are deleted immediately after use

---

## What It's Good For

✅ **Single-shot negotiations** — When both parties want to make one final offer and close the deal quickly  
✅ **Total compensation clarity** — Evaluates the complete package as one all-in number, not just base salary  
✅ **Transparency and fairness** — The mechanism is simple and predictable; both parties know how it works  
✅ **Time-sensitive situations** — Fast resolution when there's urgency to close  
✅ **Reducing negotiation fatigue** — No back-and-forth; submit numbers once and get an answer  
✅ **Outcome-only display** — The app only displays the final outcome and number, not the original inputs  
✅ **Clear boundaries** — Explicitly shows when a deal is possible vs. when ranges are too far apart  
✅ **Fair surplus distribution** — When ranges overlap, the surplus is split 50/50, ensuring both parties benefit equally  
✅ **Privacy-first** — No email addresses collected; offers deleted immediately after mechanism runs

---

## What It's NOT Good For

❌ **Multi-round negotiations** — This is a **single-use mechanism**. Each offer can only be submitted once. Once used, the offer is immediately deleted from memory.  
❌ **Non-monetizable benefits** — Only handles a single total compensation dollar amount. Does not account for signing bonuses, benefits, PTO, or other non-standard components  
❌ **Situations requiring human judgment** — The 10% "bridge zone" is flagged for human conversation, but the mechanism itself is purely algorithmic  
❌ **Long-term relationship building** — This is transactional, not relational. No negotiation history or relationship context  
❌ **Production use cases** — This is a prototype. No permanent data storage, no email integration, no audit trails  
❌ **High-stakes executive negotiations** — Designed for standard compensation negotiations, not complex C-suite packages  
❌ **Situations where flexibility matters** — The mechanism is rigid: overlap = deal, no overlap = no deal (or bridge zone flag)

### Key Limitation: Single-Use Mechanism

**Important:** Each offer link can only be used **once**. After a candidate submits their minimum:
- The offer is marked as `used = true`
- The mechanism runs exactly once
- The result is final
- The offer cannot be resubmitted or modified

This is by design — it prevents gaming the system and ensures both parties commit to their numbers. If you need to negotiate again, you must create a new offer.

---

## Using the app

The app consists of a Vite-based React frontend (`src/` → `dist/`) and a minimal Node.js backend (`server.js`). The mechanism runs on the server to ensure privacy and security.

### Technical Details

**Frontend:**
- **React 18** built with **Vite** (`src/` sources, compiled to `dist/`)
- Tailwind and framer-motion for styling/animation
- Dev server on **http://localhost:3001** (proxying `/api` to backend 3000)
- Single “Total Compensation” input/slider (no base/equity breakdowns)

**Backend:**
- **Node.js** with Express
- Serves the built frontend from `dist/`
- In-memory offer storage (no database)
- Offers expire after 24 hours; results expire after 7 days

### Running the app

```bash
git clone https://github.com/Mikeishiring/Closing-table.git
cd Closing-table
npm install
```

**Development (Vite + proxy to API):**
```bash
npm run dev
```
- Frontend: http://localhost:3001
- API proxy: http://localhost:3000/api

**Production build + serve:**
```bash
npm run build
npm start
```
- Build outputs to `dist/`; Express (`server.js`) serves that bundle on `http://localhost:3000`.

### Running Tests

```bash
npm test
```

The test suite includes:
- **Unit tests** for the `calculateDeal` function (5 tests covering all outcome scenarios)
- **Integration tests** for API endpoints (2 tests for single-use constraint and offer expiry)

### User Flow

**Phase 1: Commitment Panel (INPUT)**
- **Company View:** 
  - Company enters their maximum total compensation (single all-in number)
  - Clicks "Lock it in & Get Link"
  - Receives a shareable link (works once, expires in 24 hours)
  
- **Candidate View:**
  - Candidate opens the company's link
  - Views landing page explaining the mechanism
  - Enters their minimum total compensation (single all-in number)
  - Clicks "Lock it in & Get Link"

**Phase 2: Mechanism Processing (LOADING)**
- Brief animation showing commitment confirmation
- "Number locked. Calculating..."

**Phase 3: Result Panel (RESULT)**
- Outcome-only display showing:
  - **FAIR_SPLIT (Green):** Final total compensation number with explanation that the mechanism split the difference
  - **BRIDGE_ZONE (Yellow):** "Close Gap" status with a suggested starting point for human negotiation
  - **NO_DEAL (Red):** "No Deal" status explaining the ranges were too far apart

**Key features:**
- **Total compensation:** The mechanism runs on a single, all-inclusive total compensation number
- **Single-flow UI:** Commitment Panel → Loading → Result Panel (no redundant graphics)
- **Single-use, immediate deletion:** Each offer is deleted immediately after the mechanism runs
- **Time-limited storage:** Offers expire after 24 hours if unused, results after 7 days
- **In-memory only:** All data is ephemeral (lost on server restart)
- **Outcome-only results:** Only status and final number are stored; no original inputs
- **No email collection:** Privacy-first design; no email addresses are collected or stored
- **Pure calculation:** Core mechanism logic is isolated in `calculateDeal(CMax, CMin)` function
- **No negotiation history:** Single-shot, no audit trails

---

## Architecture Overview

The application consists of:

- **Frontend** (`frontend/index.html`): Single-page React application with inline JSX
- **Backend** (`server.js`): Node.js/Express API with in-memory data stores
- **No database**: All data is ephemeral (in-memory Maps)
- **Deployment**: Frontend on Cloudflare Pages, Backend on Render

### Data Flow

1. **Company creates offer** → Backend generates `offerId` → Returns shareable link
2. **Candidate opens link** → Frontend validates offer → Shows input form
3. **Candidate submits minimum** → Backend runs mechanism → Returns outcome
4. **Success case** → Backend generates `resultId` → Candidate gets reveal link
5. **Reveal link** → Shows stored result without re-running mechanism

---

## Technical Stack

**Frontend:**
- React 18 (production builds via CDN)
- Babel Standalone for JSX transformation
- Tailwind CSS via CDN
- Pure CSS animations (no animation libraries)

**Backend:**
- Node.js with Express
- In-memory Maps for offers and results
- Automatic cleanup of expired data
- CORS enabled for cross-origin requests

---

## Privacy & Security Model

- **No email collection** — No email addresses are collected or stored at any point
- **Immediate deletion** — Offers are deleted immediately after the mechanism runs (not just marked as used)
- **Outcome-only storage** — Results store only: status (success/close/fail), final number, suggested (for close), and timestamp
- **No input retention** — Company max, candidate min, and any breakdowns are never stored in results
- **Time-limited** — Offers expire after 24 hours if unused, results after 7 days
- **In-memory only** — All data is ephemeral (lost on server restart)
- **No negotiation thread** — No history, no audit trail, no records

This prototype prioritizes privacy and transparency over persistence.