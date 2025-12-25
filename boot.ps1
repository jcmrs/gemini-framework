# Gemini Cognitive Organism Bootloader (PowerShell)

Write-Host "===================================================" -ForegroundColor Green
Write-Host "[BOOT] Initializing Gemini Cognitive Organism..." -ForegroundColor Green
Write-Host "==================================================="

# Ensure we are in the project root
$scriptPath = $MyInvocation.MyCommand.Path
$projectRoot = Split-Path $scriptPath
Set-Location $projectRoot
Write-Host "[BOOT] Working Directory: $projectRoot"

# Check for Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not found in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit..."
    exit 1
}

# Run the Cortex
Write-Host "[BOOT] Launching Cortex (gemini/cortex/bin/cortex.js)..." -ForegroundColor Cyan
Write-Host "---------------------------------------------------" -ForegroundColor Gray

# We run node and wait for it
try {
    # Launch Node.js
    # We don't need fancy process handling here because Node will handle the child (gemini)
    & node gemini/cortex/bin/cortex.js "Initialize session. Review framework-methodology.md and confirm Cycle status."
}
catch {
    Write-Host "[BOOT] Critical Error during execution: $_" -ForegroundColor Red
}

$exitCode = $LASTEXITCODE
Write-Host "---------------------------------------------------" -ForegroundColor Gray

if ($exitCode -ne 0) {
    Write-Host "[BOOT] Cortex exited with error code $exitCode." -ForegroundColor Red
    Write-Host ""
    Write-Host "[INSTRUCTION] If you see 'spawn gemini ENOENT':" -ForegroundColor Yellow
    Write-Host "1. The 'gemini' command was not found."
    Write-Host "2. Add 'gemini' to your System PATH or edit the script."
} else {
    Write-Host "[BOOT] Cortex session finished normally." -ForegroundColor Green
}

Write-Host ""
Read-Host "Press Enter to close..."
