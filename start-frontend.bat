@echo off
cd /d "%~dp0app"

if not exist node_modules (
  echo ERROR: node_modules not found. Run install.bat first.
  pause
  exit /b 1
)

if not exist .env.local (
  echo WARNING: app\.env.local not found.
  echo Run install.bat to create it, then set NEXT_PUBLIC_API_KEY.
  echo.
)

echo Starting frontend on http://localhost:3000 ...
echo Open http://localhost:3000 in your browser.
echo.
npm run dev
echo.
echo Frontend stopped (exit code %errorlevel%)
pause
