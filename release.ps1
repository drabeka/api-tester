# Release-Script: Version setzen, Build, Commit, Tag, Push
# Usage: .\release.ps1 -Version "1.6.0" -Description "Kurze Beschreibung"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,

    [Parameter(Mandatory=$true)]
    [string]$Description
)

$ErrorActionPreference = "Stop"

# Pruefen ob es uncommitted changes gibt
$status = git status --porcelain
if (-not $status) {
    Write-Host "Keine Aenderungen zum Committen vorhanden." -ForegroundColor Yellow
    #exit 1
}

Write-Host "=== Release v$Version ===" -ForegroundColor Cyan

# 1. Version in package.json setzen
Write-Host "[1/5] Version auf $Version setzen..." -ForegroundColor Green
$pkg = Get-Content package.json -Raw
$pkg = $pkg -replace '"version": ".*?"', "`"version`": `"$Version`""
$pkg | Set-Content package.json -NoNewline

# 2. Build
Write-Host "[2/5] Build erstellen..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

# 3. Commit
Write-Host "[3/5] Aenderungen committen..." -ForegroundColor Green
git add -A
git commit -m "v$Version - $Description"

# 4. Tag
Write-Host "[4/5] Git Tag v$Version erstellen..." -ForegroundColor Green
git tag -a "v$Version" -m "v$Version - $Description"

# 5. Push
Write-Host "[5/5] Push zu origin..." -ForegroundColor Green
git push origin master --tags

Write-Host ""
Write-Host "=== Release v$Version erfolgreich! ===" -ForegroundColor Cyan
Write-Host "GitHub Actions erstellt jetzt automatisch das Release mit ZIP."
