@echo off
echo ============================================
echo  iRents Site Machine - Windows Installer
echo ============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Download from https://nodejs.org/ ^(v20 or newer^)
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
  echo ERROR: Backend install failed. See error above.
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
echo  Setting up environment files...
echo ============================================

if not exist "%~dp0backend\.env" (
  copy "%~dp0.env.example" "%~dp0backend\.env" >nul
  echo backend\.env created.
)

if not exist "%~dp0app\.env.local" (
  copy "%~dp0.env.example" "%~dp0app\.env.local" >nul
  echo app\.env.local created.
)

echo.
echo ============================================
echo  Installation complete!
echo ============================================
echo.
echo IMPORTANT - Before starting:
echo.
echo   1. Open backend\.env in Notepad
echo   2. Set APP_API_KEY to any password ^(e.g. mysecret123^)
echo   3. Set OPENAI_API_KEY to your OpenAI key
echo   4. Open app\.env.local in Notepad
echo   5. Set NEXT_PUBLIC_API_KEY to the SAME password
echo      ^(must match APP_API_KEY in backend\.env^)
echo.
echo Then:
echo   6. Run start-backend.bat  ^(keep it open^)
echo   7. Run start-frontend.bat ^(keep it open^)
echo   8. Open http://localhost:3000
echo.
pause
