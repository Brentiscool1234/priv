@echo off
echo ============================================
echo  iRents Site Machine - Windows Installer
echo ============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Download from https://nodejs.org/ ^(LTS version^)
  pause
  exit /b 1
)

for /f "tokens=1" %%v in ('node -v') do set NODE_VER=%%v
echo Node.js: %NODE_VER%

echo.
echo [1/2] Installing backend dependencies...
cd /d "%~dp0backend"
npm install
if %errorlevel% neq 0 (
  echo.
  echo =============================================
  echo  INSTALL FAILED
  echo =============================================
  echo.
  echo If you see an error about "better-sqlite3" or "node-gyp":
  echo.
  echo   Option A ^(easiest^): Install Visual C++ Build Tools
  echo   Run PowerShell as Administrator and type:
  echo     npm install --global windows-build-tools
  echo.
  echo   Option B: Download the installer manually:
  echo   https://visualstudio.microsoft.com/visual-cpp-build-tools/
  echo   Select "Desktop development with C++"
  echo.
  echo Then close this window and run install.bat again.
  echo.
  pause
  exit /b 1
)

echo.
echo [2/2] Installing frontend dependencies...
cd /d "%~dp0app"
npm install
if %errorlevel% neq 0 (
  echo ERROR: Frontend install failed. See error above.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  Installation complete!
echo ============================================
echo.
echo Next steps:
echo   1. Open backend\.env in Notepad
echo      ^(it was copied from .env.example^)
echo   2. Set APP_API_KEY to any password you want
echo   3. Set OPENAI_API_KEY to your OpenAI key
echo   4. Run start-backend.bat  ^(keep it open^)
echo   5. Run start-frontend.bat ^(keep it open^)
echo   6. Open http://localhost:3000
echo.

if not exist "%~dp0backend\.env" (
  copy "%~dp0.env.example" "%~dp0backend\.env" >nul
  echo backend\.env has been created from .env.example.
)

pause
