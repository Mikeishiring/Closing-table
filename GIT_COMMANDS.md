# Git Commands Reference

## Standard Workflow

### 1. Check Status
```bash
git status
```

### 2. Pull Latest Changes (with rebase)
```bash
git pull --rebase origin main
```

### 3. Add Files
```bash
# Add all changes
git add -A

# Or add specific files
git add server.js package.json
```

### 4. Commit
```bash
git commit -m "Your commit message here"
```

### 5. Push
```bash
git push origin main
```

## Complete Workflow (One-liner Sequence)

```bash
# Pull latest changes
git pull --rebase origin main

# Stage all changes
git add -A

# Commit with message
git commit -m "Update server.js and package.json"

# Push to remote
git push origin main
```

## Alternative: Interactive Rebase

If you want to clean up commit history:
```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# Or rebase from a specific commit
git rebase -i <commit-hash>
```

## Troubleshooting

### If pull fails due to uncommitted changes:
```bash
# Stash changes, pull, then restore
git stash
git pull --rebase origin main
git stash pop
```

### If push is rejected:
```bash
# Pull and rebase first
git pull --rebase origin main
git push origin main
```

### Undo last commit (keep changes):
```bash
git reset --soft HEAD~1
```

### Undo last commit (discard changes):
```bash
git reset --hard HEAD~1
```

