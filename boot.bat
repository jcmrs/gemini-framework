@echo off
title Gemini Cognitive Organism Bootloader
color 0A

echo ===================================================
echo [BOOT] Initializing Gemini Cognitive Organism...
echo ===================================================

:: Ensure we are in the project root
cd /d "%~dp0"
echo [BOOT] Working Directory: %CD%

:: Check if node is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Run the Init Sequence through the Cortex
echo [BOOT] Launching Cortex (gemini/cortex/bin/cortex.js)...
echo ---------------------------------------------------

node gemini/cortex/bin/cortex.js "Initialize session. Review framework-methodology.md and confirm Cycle status."

echo ---------------------------------------------------
if %errorlevel% neq 0 (
    color 0C
    echo [BOOT] Cortex exited with error code %errorlevel%.
) else (
    echo [BOOT] Cortex session finished normally.
)

echo.
echo [INSTRUCTION] If you see "spawn gemini ENOENT" or similar errors above:
echo 1. The 'gemini' command was not found.
echo 2. You may need to run this from your specific terminal, or add 'gemini' to your PATH.
echo.
pause