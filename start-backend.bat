@echo off
cd /d "%~dp0backend"
if not exist .env (
  copy ..\\.env.example .env
  echo .env created from .env.example - edit it before continuing
  pause
  exit /b 1
)
npx ts-node src/index.ts
