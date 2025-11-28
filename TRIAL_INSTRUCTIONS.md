# How to Trial The Closing Table

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   - Go to `http://localhost:3000`
   - You should see the company view

## Testing the Flow

### As a Company:
1. Set your maximum budget (use the slider)
2. Enter your email address
3. Click "Lock Budget & Create Link"
4. Copy the generated link (e.g., `http://localhost:3000/#offer=abc123...`)

### As a Candidate:
1. Open the link you received (or use the "Preview Candidate View" button)
2. Read the intro, then click "Take Your Seat at the Table"
3. Set your minimum salary
4. Optionally click "Check Market Data" for guidance
5. Enter your email
6. Click "Submit Final Number"
7. See the result:
   - **Success**: Deal accepted with final salary
   - **Close**: Within 10% - suggests a conversation
   - **Fail**: Gap too large (>10%)

## Testing Different Scenarios

- **Overlap (Success)**: Set company max to $140k, candidate min to $120k
- **Close (10% gap)**: Set company max to $140k, candidate min to $150k
- **Fail (>10% gap)**: Set company max to $140k, candidate min to $160k

## Troubleshooting

- **Port already in use?** Set `PORT=3001 npm start` (or any other port)
- **npm not found?** Install Node.js from https://nodejs.org/
- **Dependencies fail?** Try deleting `node_modules` and `package-lock.json`, then `npm install` again

