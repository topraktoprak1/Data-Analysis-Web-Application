<#
PowerShell helper to remove large folders from Git history.
WARNING: This rewrites repository history. Make a backup and coordinate with collaborators.
#>

Write-Host "This will rewrite git history and remove uploads and Bootstrap Studio Backups" -ForegroundColor Yellow
Write-Host "Make sure you have a backup and all collaborators are notified." -ForegroundColor Yellow
Read-Host "Press Enter to continue or Ctrl+C to abort"

foreach ($p in @('uploads', 'Bootstrap Studio Backups')) {
    Write-Host "Removing $p from history..."
    git filter-branch --force --index-filter "git rm -r --cached --ignore-unmatch '$p'" --prune-empty --tag-name-filter cat -- --all
}

Write-Host "Prune and garbage-collecting..."
git for-each-ref --format='%(refname)' refs/original/ | %{ git update-ref -d $_ }
git reflog expire --expire=now --all
git gc --prune=now
git gc --aggressive --prune=now

Write-Host "Done. Force-push required to update remote: git push origin --force --all" -ForegroundColor Green
