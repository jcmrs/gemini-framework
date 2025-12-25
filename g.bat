@echo off
:: Gemini Cortex Wrapper
:: Usage: gemini.bat <command> [args]

set CORTEX_BIN=gemini\cortex\bin\cortex.js

:: Ensure we are in the project root if double-clicked
if "%~dp0" neq "" cd /d "%~dp0"

if "%1"=="init" (
    node %CORTEX_BIN% "Initialize session. Review framework-methodology.md and confirm Cycle status."
    if %errorlevel% neq 0 pause
    exit /b
)

if "%1"=="review" (
    node %CORTEX_BIN% "Start code review (gemini/skills/code-review.md). Scope: %2"
    if %errorlevel% neq 0 pause
    exit /b
)

if "%1"=="brainstorm" (
    node %CORTEX_BIN% "Start brainstorming (gemini/skills/brainstorming.md). Topic: %2"
    if %errorlevel% neq 0 pause
    exit /b
)

if "%1"=="log" (
    node %CORTEX_BIN% "Document session (gemini/skills/conversation-log.md)."
    if %errorlevel% neq 0 pause
    exit /b
)

:: Default: Pass through to Cortex
node %CORTEX_BIN% "%*"
if %errorlevel% neq 0 pause