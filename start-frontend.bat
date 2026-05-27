@echo off
cd /d "%~dp0app"

if not exist node_modules (
  echo ERROR: node_modules not found. Run install.bat first.
  pause
  exit /b 1
)

echo Starting frontend on http://localhost:3000 ...
echo.
npm run dev
echo.
echo Frontend stopped (exit code %errorlevel%)
pause
