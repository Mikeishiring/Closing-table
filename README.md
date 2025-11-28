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

The whole app lives in a single `index.html` file.

### 1. Run it

```bash
git clone https://github.com/Mikeishiring/Closing-table.git
cd Closing-table
# Option A: just open index.html in your browser
# Option B (recommended):
python -m http.server 8000
# then open http://localhost:8000/index.html
```