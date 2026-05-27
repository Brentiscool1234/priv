@echo off
cd /d "%~dp0backend"

if not exist node_modules (
  echo ERROR: node_modules not found. Run install.bat first.
  pause
  exit /b 1
)

if not exist .env (
  echo Creating .env from .env.example...
  copy "%~dp0.env.example" .env
  echo.
  echo .env has been created. Open backend\.env in Notepad and fill in:
  echo   APP_API_KEY=anything-you-want
  echo   OPENAI_API_KEY=sk-...your-key...
  echo.
  pause
  exit /b 1
)

echo Starting backend on http://localhost:4000 ...
echo.
npx ts-node src/index.ts
echo.
echo Backend stopped (exit code %errorlevel%)
pause
