# Git Helper Script
# Use this until you restart VS Code/Terminal

$gitPath = "C:\Program Files\Git\cmd\git.exe"

# Add Git to PATH for this session
$env:Path += ";C:\Program Files\Git\cmd"

Write-Host "Git is now available in this session!" -ForegroundColor Green
Write-Host "You can now use 'git' commands directly." -ForegroundColor Green
Write-Host ""
Write-Host "Example workflow:" -ForegroundColor Yellow
Write-Host "  git pull --rebase origin main" -ForegroundColor Cyan
Write-Host "  git add -A" -ForegroundColor Cyan
Write-Host "  git commit -m 'Your message here'" -ForegroundColor Cyan
Write-Host "  git push" -ForegroundColor Cyan
