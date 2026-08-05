@echo off
setlocal enabledelayedexpansion

echo ============================================
echo  iRents Site Machine - Windows Installer
echo ============================================
echo.

:: ── Node.js check ────────────────────────────
where node >nul 2>&1
if !errorlevel! neq 0 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo.
  echo Download Node.js v20 or newer from:
  echo   https://nodejs.org/
  echo.
  echo After installing, close this window and run install.bat again.
  goto :end
)

for /f "tokens=1" %%v in ('node -v') do set NODE_VER=%%v
echo Node.js found: !NODE_VER!

where npm >nul 2>&1
if !errorlevel! neq 0 (
  echo ERROR: npm is not found. Reinstall Node.js from https://nodejs.org/
  goto :end
)

echo npm found: OK
echo.

:: ── Backend install ───────────────────────────
echo [1/2] Installing backend dependencies...
echo       ^(this may take 1-2 minutes^)
echo.
cd /d "%~dp0backend"
if !errorlevel! neq 0 (
  echo ERROR: Could not navigate to backend folder.
  echo Make sure you extracted the full project folder.
  goto :end
)

call npm install 2>&1
if !errorlevel! neq 0 (
  echo.
  echo ERROR: Backend install failed ^(exit code !errorlevel!^).
  echo Check the error messages above. Common causes:
  echo   - No internet connection
  echo   - Firewall or antivirus blocking npm
  echo   - Disk space issue
  goto :end
)
echo Backend: OK
echo.

:: ── Frontend install ──────────────────────────
echo [2/2] Installing frontend dependencies...
echo       ^(this may take 2-3 minutes^)
echo.
cd /d "%~dp0app"
if !errorlevel! neq 0 (
  echo ERROR: Could not navigate to app folder.
  goto :end
)

call npm install 2>&1
if !errorlevel! neq 0 (
  echo.
  echo ERROR: Frontend install failed ^(exit code !errorlevel!^).
  goto :end
)
echo Frontend: OK
echo.

:: ── Environment files ─────────────────────────
echo ============================================
echo  Setting up environment files...
echo ============================================

if not exist "%~dp0backend\.env" (
  copy "%~dp0.env.example" "%~dp0backend\.env" >nul
  echo Created: backend\.env
) else (
  echo Skipped: backend\.env already exists
)

if not exist "%~dp0app\.env.local" (
  copy "%~dp0.env.example" "%~dp0app\.env.local" >nul
  echo Created: app\.env.local
) else (
  echo Skipped: app\.env.local already exists
)

echo.
echo ============================================
echo  Installation complete!
echo ============================================
echo.
echo NEXT STEPS:
echo.
echo   1. Open backend\.env in Notepad
echo      Set APP_API_KEY  = any password ^(e.g. mysecret123^)
echo      Set OPENAI_API_KEY = your OpenAI key ^(sk-...^)
echo.
echo   2. Open app\.env.local in Notepad
echo      Set NEXT_PUBLIC_API_KEY = same password as APP_API_KEY
echo.
echo   3. Run start-backend.bat  ^(keep the window open^)
echo   4. Run start-frontend.bat ^(keep the window open^)
echo   5. Open http://localhost:3000 in your browser
echo.

:end
echo ============================================
echo  Press any key to close this window...
echo ============================================
pause >nul
