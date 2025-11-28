# Setup & Push Guide

## Part 1: Trial/Test the App

### Step 1: Install Node.js (if not already installed)

1. Download Node.js from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - This includes both Node.js and npm

2. After installation, **restart your terminal/PowerShell**

3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Dependencies

```bash
npm install
```

This will create a `node_modules` folder with all required packages.

### Step 3: Start the Server

```bash
npm start
```

You should see: `Closing Table server running on http://localhost:3000`

### Step 4: Test in Browser

1. Open your browser
2. Go to: `http://localhost:3000`
3. You should see "The Closing Table" interface

### Testing the Full Flow

1. **Company View**: Set budget, enter email, create link
2. **Copy the link** (it will look like `http://localhost:3000/#offer=abc123...`)
3. **Open in new tab** or use "Preview Candidate View" button
4. **Candidate View**: Set minimum, submit, see result

---

## Part 2: Push to GitHub

### Step 1: Check What Changed

```bash
git status
```

You should see:
- Modified: `README.md`, `index.html`
- New files: `.gitignore`, `package.json`, `server.js`

### Step 2: Add All Files

```bash
git add .
```

Or add individually:
```bash
git add .gitignore
git add package.json
git add server.js
git add README.md
git add index.html
```

### Step 3: Commit Changes

```bash
git commit -m "Add backend API with Express server and update frontend to use API endpoints"
```

Or use a more detailed message:
```bash
git commit -m "Add Node.js backend with API endpoints

- Add Express server with in-memory offer storage
- Implement POST /api/offers, GET /api/offers/:id, POST /api/offers/:id/submit
- Update frontend to use API instead of URL hash encoding
- Add Dragonfly DCCR link and clarify 10% bridge behavior
- Add package.json and update README with backend instructions"
```

### Step 4: Push to GitHub

```bash
git push origin main
```

If you get an error about upstream, try:
```bash
git push -u origin main
```

### Troubleshooting Git Push

**If you get authentication errors:**
- GitHub now requires personal access tokens instead of passwords
- Go to: https://github.com/settings/tokens
- Create a new token with `repo` permissions
- Use the token as your password when prompted

**If you need to check your remote:**
```bash
git remote -v
```

**If remote is not set:**
```bash
git remote add origin https://github.com/Mikeishiring/Closing-table.git
```

---

## Quick Reference

### Trial Commands:
```bash
npm install          # Install dependencies (first time only)
npm start            # Start server
# Then open http://localhost:3000
```

### Git Commands:
```bash
git add .            # Stage all changes
git commit -m "..."   # Commit with message
git push origin main # Push to GitHub
```

