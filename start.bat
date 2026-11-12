@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === PC Store API ===

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nu este instalat. Descarca-l de pe https://nodejs.org
  goto err
)

if not exist node_modules (
  echo Instalez pachetele ^(durata ~1 minut^)...
  call npm install
  if errorlevel 1 goto err
)

if not exist .env (
  node scripts\setup.js
  if errorlevel 1 goto err
)

echo Pregatesc baza de date...
call npm run db:setup
if errorlevel 1 goto err

echo.
echo Pornesc serverul. Swagger: http://localhost:3000/api-docs
echo ^(opreste-l cu Ctrl+C^)
call npm start
pause
exit /b 0

:err
echo.
echo A aparut o eroare - citeste mesajul de mai sus.
pause
exit /b 1
