# AI-Assisted Commit Messages Guide

## Method 1: Using Cursor AI (Built-in)

### Quick AI Commit Message
1. **Stage your changes:**
   ```bash
   git add -A
   ```

2. **Ask Cursor AI to generate commit message:**
   - In Cursor, you can ask: "Generate a git commit message for these changes"
   - Or use Cursor's command palette (Ctrl+Shift+P) and look for commit-related commands

3. **Copy the AI-generated message and commit:**
   ```bash
   git commit -m "AI-generated message here"
   ```

## Method 2: Manual AI Prompt (ChatGPT/Claude/Cursor)

### Prompt Template:
```
Generate a concise git commit message for these changes:
[Paste git diff or describe changes]

Follow conventional commit format:
- feat: for new features
- fix: for bug fixes
- refactor: for code restructuring
- docs: for documentation
- style: for formatting
- test: for tests
- chore: for maintenance

Keep it under 72 characters for the subject line.
```

### Example:
```
Generate a concise git commit message for these changes:
- Replaced server.js with ES6 module version
- Updated package.json to use "type": "module"
- Changed default port to 10000
- Simplified ID generation (removed UUID dependency)
- Changed offer TTL to 4 hours
```

**AI might generate:**
```
refactor: migrate server to ES6 modules and simplify dependencies

- Replace CommonJS with ES6 import/export
- Remove UUID dependency, use simple ID generator
- Update default port to 10000
- Reduce offer TTL to 4 hours
```

## Method 3: GitHub Copilot CLI (if installed)

```bash
# Install GitHub Copilot CLI (if not installed)
npm install -g @githubnext/github-copilot-cli

# Generate commit message
gh copilot suggest --commit

# Or interactive mode
gh copilot suggest
```

## Method 4: Git Hook with AI (Advanced)

### Create `.git/hooks/prepare-commit-msg`:

```bash
#!/bin/bash
# This hook uses AI to suggest commit messages

# Get the diff
DIFF=$(git diff --cached)

# Use a simple AI API or local model
# Example with curl to an AI service (you'd need to set this up)
# COMMIT_MSG=$(curl -X POST https://api.example.com/generate-commit -d "$DIFF")

# Or use GitHub Copilot CLI
COMMIT_MSG=$(gh copilot suggest --commit 2>/dev/null)

if [ ! -z "$COMMIT_MSG" ]; then
  echo "$COMMIT_MSG" > "$1"
fi
```

## Method 5: Quick Cursor Workflow

### In Cursor Editor:

1. **Make your changes**
2. **Open Cursor Chat** (Ctrl+L or Cmd+L)
3. **Ask:**
   ```
   Review my git changes and suggest a commit message in conventional commit format
   ```
4. **Cursor will analyze your staged/unstaged changes**
5. **Copy the suggested message**
6. **Commit:**
   ```bash
   git add -A
   git commit -m "Cursor's suggested message"
   ```

## Method 6: Using `git commit` with AI (Custom Script)

### Create `ai-commit.sh`:

```bash
#!/bin/bash
# AI-assisted commit script

# Stage all changes
git add -A

# Get diff
DIFF=$(git diff --cached)

# Ask Cursor AI or your preferred AI
echo "Generating commit message..."
# You could pipe this to Cursor or another AI tool

# For now, show diff and prompt
echo "Changes:"
git diff --cached --stat

# Prompt for message
read -p "Enter commit message (or press Enter for AI suggestion): " msg

if [ -z "$msg" ]; then
  # Use AI to generate (you'd implement this)
  msg="feat: AI-generated commit message"
fi

git commit -m "$msg"
```

## Recommended Workflow (Cursor + Manual)

### Step-by-Step:

1. **Make your changes in Cursor**

2. **Check what changed:**
   ```bash
   git status
   git diff
   ```

3. **Ask Cursor AI:**
   - Open chat (Ctrl+L)
   - "Generate a git commit message for my current changes"
   - Cursor will analyze and suggest

4. **Review and commit:**
   ```bash
   git add -A
   git commit -m "Cursor's suggested message (or edit it)"
   ```

5. **Push:**
   ```bash
   git push origin main
   ```

## Conventional Commit Format (Recommended)

AI-generated messages should follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**
```
refactor(server): migrate to ES6 modules

- Replace require() with import statements
- Update package.json to use "type": "module"
- Simplify ID generation
- Change default port to 10000
```

## Quick Reference Commands

```bash
# Full workflow with AI-assisted commit
git pull --rebase origin main
git add -A
# [Ask Cursor AI for commit message]
git commit -m "AI-generated message"
git push origin main
```

