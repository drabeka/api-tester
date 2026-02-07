@echo off
REM ===================================================
REM API Test Framework - Release Package Erstellen
REM ===================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          Release-Paket erstellen...                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Release-Verzeichnis erstellen
set RELEASE_DIR=release
set RELEASE_NAME=api-tester-release

echo [1/4] Lösche altes Release-Verzeichnis...
if exist %RELEASE_DIR% rmdir /s /q %RELEASE_DIR%
mkdir %RELEASE_DIR%
mkdir %RELEASE_DIR%\%RELEASE_NAME%

echo [2/4] Kopiere notwendige Dateien...

REM Haupt-Dateien
copy index.html %RELEASE_DIR%\%RELEASE_NAME%\ >nul
copy server.js %RELEASE_DIR%\%RELEASE_NAME%\ >nul
copy start.bat %RELEASE_DIR%\%RELEASE_NAME%\ >nul
copy start.sh %RELEASE_DIR%\%RELEASE_NAME%\ >nul
copy README.md %RELEASE_DIR%\%RELEASE_NAME%\ >nul
copy INSTALL.md %RELEASE_DIR%\%RELEASE_NAME%\ >nul

REM Verzeichnisse
xcopy /E /I /Q config %RELEASE_DIR%\%RELEASE_NAME%\config\ >nul
xcopy /E /I /Q dist %RELEASE_DIR%\%RELEASE_NAME%\dist\ >nul

echo [3/4] Erstelle ZIP-Archiv...

REM PowerShell zum ZIP erstellen verwenden
powershell -command "Compress-Archive -Path '%RELEASE_DIR%\%RELEASE_NAME%\*' -DestinationPath '%RELEASE_DIR%\%RELEASE_NAME%.zip' -Force"

echo [4/4] Aufräumen...

echo.
echo ✓ Release-Paket erstellt!
echo.
echo Dateien:
echo   • %RELEASE_DIR%\%RELEASE_NAME%\        (Verzeichnis)
echo   • %RELEASE_DIR%\%RELEASE_NAME%.zip     (ZIP-Archiv)
echo.
echo Das ZIP-Archiv kann jetzt auf andere Rechner kopiert werden.
echo.
pause
