@echo off
title London Kids Preschool - Server Launcher
echo ========================================================
echo   London Kids Preschool Avalurpet - Web Server
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking MongoDB Database Service...
sc query "MongoDB" | find "RUNNING" >nul
if %ERRORLEVEL% EQU 0 (
    echo   - MongoDB Server is active and running.
) else (
    echo   - Starting MongoDB Windows service...
    net start MongoDB
)

echo.
echo [2/3] Checking Node environment & build...
if not exist ".next" (
    echo   - First-time production build in progress...
    call npm run build
) else (
    echo   - Build ready.
)

echo.
echo [3/3] Starting web server on http://localhost:3000 ...
echo   - Local access:   http://localhost:3000
echo   - Keep this window open while using the website.
echo   - Press Ctrl + C to stop the server when done.
echo.

start http://localhost:3000

call npm run start
pause
