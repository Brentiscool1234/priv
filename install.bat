@echo off
echo Installing backend dependencies...
cd /d "%~dp0backend"
npm install
if %errorlevel% neq 0 (
  echo.
  echo --- better-sqlite3 failed to compile ---
  echo This needs Visual C++ Build Tools. Run this command to install them:
  echo   npm install --global windows-build-tools
  echo Or install from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
  echo Then run install.bat again.
  pause
  exit /b 1
)
echo.
echo Installing frontend dependencies...
cd /d "%~dp0app"
npm install
echo.
echo Done. Copy .env.example to backend\.env and fill in your keys.
echo Then run start-backend.bat and start-frontend.bat in separate terminals.
pause
