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

### The Mechanism (Step-by-Step)

- The **company** secretly chooses a maximum salary (`CMax`).
- The **candidate** secretly chooses a minimum salary (`CMin`).
- Neither side ever sees the other's number.

The app then:

1. **Deal found (overlap)**  
   If `CMin ≤ CMax`, there is an overlap.  
   - It computes the surplus: `Surplus = CMax - CMin`.  
   - It sets the final salary halfway between them and then **rounds to the nearest \$1,000**.  
   - The candidate never goes below their minimum.  
   - The company never goes above their max.

2. **Gap, but close (within 10%)**  
   If `CMin` is above `CMax` but within 10%:
   - No automatic deal.
   - The app shows a **"Gap Detected"** state and suggests a short call to see if stock/bonus/etc. can bridge the gap.

3. **Gap too large**  
   If `CMin` is more than 10% above `CMax`:
   - The app shows **"No Deal"** and suggests restarting the search.

The candidate screen also has a **"Check Market Data"** button that, in this prototype, shows illustrative guidance to help candidates sanity-check their ask. This is not a real market data feed — it's a prototype feature.

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

### How Offers Work

- **Company creates an offer**: Sets a maximum budget and email, then clicks "Lock Budget & Create Link"
- **Server stores the offer**: The backend creates a unique `offerId` and stores the offer data in memory
- **Shareable link generated**: Link format is `/#offer=<offerId>` (e.g., `/#offer=abc123-def456-...`)
- **Candidate opens link**: Frontend calls `GET /api/offers/:offerId` to verify the offer is valid
- **Candidate submits minimum**: Frontend calls `POST /api/offers/:offerId/submit` with their minimum salary
- **Server runs mechanism**: The backend calculates the result (success/close/fail) and marks the offer as used
- **Result displayed**: Candidate sees the outcome based on the mechanism's calculation

**Key features:**
- Offers expire after 24 hours
- Each offer can only be used **once** (single-shot mechanism)
- Results are stored for 7 days (for reveal links)
- All data is stored in memory (lost on server restart)
- No permanent data storage — matches the "no recording" ethos
- No email integration (prototype only)
- No negotiation history or audit trails

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