@echo off
REM ===================================================
REM API Test Framework - Windows Start Script
REM ===================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          API Test Framework - Starten...                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Prüfen ob Node.js installiert ist
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ FEHLER: Node.js ist nicht installiert!
    echo.
    echo Bitte installieren Sie Node.js von https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Node.js Version anzeigen
echo ✓ Node.js gefunden
node --version
echo.

REM Server starten
echo Starte Server...
echo.
node server.js

pause
