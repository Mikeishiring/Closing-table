# The Closing Table

The Closing Table is a web application that implements a **single-shot, double-blind salary negotiation mechanism**. It's designed to eliminate negotiation gamesmanship by having both parties submit their true walk-away numbers simultaneously, then automatically computing a fair outcome if ranges overlap.

## What This Project Is About

The Closing Table addresses a fundamental problem in salary negotiations: **information asymmetry and strategic gaming**. Traditional negotiations often devolve into back-and-forth haggling where neither party reveals their true limits, leading to inefficient outcomes and potential deal failures.

**The core idea:**
> Company sets its true maximum salary. Candidate sets their true minimum.  
> If the ranges overlap, the app instantly closes a fair deal by splitting the difference 50/50.  
> If they don't overlap, the app clearly signals whether a human conversation could bridge the gap.

This is a **prototype** to explore fair, transparent, double-blind negotiation mechanisms — not a production compensation tool.

---

## How It Works

The mechanism operates on a simple mathematical principle: when two parties' acceptable ranges overlap, there's a "surplus" that can be split fairly. The app ensures neither party goes below their minimum or above their maximum.

### The Mechanism (Mathematical Definition)

**Inputs:**
- `CMax`: Company's true maximum salary (private, submitted first)
- `CMin`: Candidate's true minimum salary (private, submitted second)

**Calculation:**
1. **FAIR_SPLIT (Overlap Case):** If `CMin ≤ CMax`
   - Surplus = `CMax - CMin`
   - Final Offer = `CMin + (Surplus / 2)`
   - Final Offer is rounded to the nearest $1,000
   - Status: `success`

2. **BRIDGE_ZONE (Close Gap):** If `CMin > CMax` and `(CMin - CMax) / CMax ≤ 0.10`
   - Gap = `CMin - CMax`
   - Gap is within 10% of company's maximum
   - Status: `close` (suggests human conversation)

3. **NO_DEAL (Large Gap):** If `CMin > CMax` and `(CMin - CMax) / CMax > 0.10`
   - Gap = `CMin - CMax`
   - Gap exceeds 10% threshold
   - Status: `fail` (deal cannot be closed)

**Key Properties:**
- **Double-blind:** Neither party sees the other's number until after submission
- **Single-use:** Each offer can only be submitted once
- **Fair split:** When overlap exists, surplus is divided exactly 50/50
- **Rounding:** Final offers are rounded to nearest $1,000 for privacy and simplicity

---

## What It's Good For

✅ **Single-shot negotiations** — When both parties want to make one final offer and close the deal quickly  
✅ **Transparency and fairness** — Eliminates negotiation gamesmanship; both parties know the mechanism is fair  
✅ **Time-sensitive situations** — Fast resolution when there's urgency to close  
✅ **Reducing negotiation fatigue** — No back-and-forth; submit numbers once and get an answer  
✅ **Protecting privacy** — Neither party sees the other's number until the mechanism computes the outcome  
✅ **Clear boundaries** — Explicitly shows when a deal is possible vs. when ranges are too far apart  
✅ **Fair surplus distribution** — When ranges overlap, the surplus is split 50/50, ensuring both parties benefit equally

---

## What It's NOT Good For

❌ **Multi-round negotiations** — This is a **single-use mechanism**. Each offer can only be submitted once. Once used, the offer is marked as "used" and cannot be resubmitted.  
❌ **Complex compensation packages** — Only handles base salary. Does not account for equity, bonuses, benefits, or other compensation components  
❌ **Situations requiring human judgment** — The 10% "bridge zone" is flagged for human conversation, but the mechanism itself is purely algorithmic  
❌ **Long-term relationship building** — This is transactional, not relational. No negotiation history or relationship context  
❌ **Production use cases** — This is a prototype. No permanent data storage, no email integration, no audit trails  
❌ **High-stakes executive negotiations** — Designed for standard salary negotiations, not complex C-suite packages  
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

The app consists of a single-page frontend (`index.html`) and a minimal Node.js backend (`server.js`). The mechanism runs on the server to ensure privacy and security.

### Technical Details

**Frontend:**
- **React 18** (production builds via CDN)
- **Babel Standalone** for JSX transformation in the browser
- **Tailwind CSS** via CDN
- All frontend code is in a single HTML file with inline JavaScript

**Backend:**
- **Node.js** with Express
- In-memory offer storage (no database)
- Offers expire after 24 hours
- Automatic cleanup of expired offers

### Running the app

```bash
git clone https://github.com/Mikeishiring/Closing-table.git
cd Closing-table
```

**Install dependencies:**
```bash
npm install
```

**Start the server:**
```bash
npm start
```

The server will run on `http://localhost:3000` (or the port specified by the `PORT` environment variable).

Open `http://localhost:3000` in your browser.

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
  - Company enters their maximum budget (CMax) and email
  - Clicks "🔒 Lock Budget & Create Link"
  - Receives a shareable link
  
- **Candidate View:**
  - Candidate opens the company's link
  - Views landing page explaining the mechanism
  - Enters their walk-away number (CMin) and email
  - Clicks "🔒 Commit & See Your Result"

**Phase 2: Mechanism Processing (LOADING)**
- Brief animation showing commitment confirmation
- "CMin Locked. Waiting for CMax... Running Double-Blind Mechanism... Calculating Fair Split..."

**Phase 3: Result Panel (RESULT)**
- Single dynamic visualization showing:
  - **FAIR_SPLIT (Green):** Revealed CMax and CMin, visual bar with "Shared Surplus (50/50)", final offer, and benefit gained
  - **BRIDGE_ZONE (Yellow):** Gap visualization with "10% Bridge Window", suggests human conversation
  - **NO_DEAL (Red):** Large gap visualization, suggests restarting search
- Closing Table Signature for successful deals with shareable confirmation link

**Key features:**
- **Single-flow UI:** Commitment Panel → Loading → Result Panel (no redundant graphics)
- **Single-use constraint:** Each offer can only be submitted once (enforced with 403 error on re-submission)
- **Time-limited storage:** Offers expire after 24 hours, results after 7 days
- **In-memory only:** All data is ephemeral (lost on server restart)
- **No permanent storage:** Matches the "no recording" ethos
- **Pure calculation:** Core mechanism logic is isolated in `calculateDeal(CMax, CMin)` function
- **No email integration:** Prototype only (stub implementation)
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

- **No permanent storage** — All data is in-memory and lost on server restart
- **Time-limited** — Offers expire after 24 hours, results after 7 days
- **Single-use** — Each offer can only be submitted once
- **Double-blind** — Neither party sees the other's number until outcome is computed
- **No negotiation thread** — No history, no audit trail, no records

This prototype prioritizes privacy and transparency over persistence.