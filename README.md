# The Closing Table

The Closing Table is a small web app that runs a simple idea:

> Company sets its true max salary. Candidate sets their true minimum.  
> If the ranges overlap, the app instantly closes a fair deal by splitting the difference.

This is a **prototype** to explore fair, double-blind salary negotiation — not a production compensation tool.

---

## How it works (in plain language)

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

The candidate screen also has a **"Check Market Data"** button that, in this prototype, shows a suggested number slightly below the company's max to nudge under-confident candidates toward a reasonable ask.

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
- Each offer can only be used once
- All data is stored in memory (lost on server restart)
- No permanent data storage — matches the "no recording" ethos