@echo off
title London Kids Preschool - Server Launcher
echo ========================================================
echo   London Kids Preschool Avalurpet - Web Server
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking MongoDB Database Service...
sc query MongoDB 2>nul | findstr /i "RUNNING" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [OK] MongoDB Server is active and running.
) else (
    echo   - MongoDB service is not currently active.
    echo   - Attempting to start MongoDB service...
    net start MongoDB 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo   [OK] MongoDB service started successfully.
    ) else (
        echo   - Notice: Could not start MongoDB service automatically.
        echo             If MongoDB runs as a background process or on cloud,
        echo             the web app will connect directly.
    )
)

echo.
echo [2/3] Checking Node environment & build...
if not exist ".next" (
    echo   - Building application for production...
    call npm run build
) else (
    echo   [OK] Application build is ready.
)

echo.
echo [3/3] Starting web server on http://localhost:3000 ...
echo   - Local access:   http://localhost:3000
echo   - Keep this window open while using the website.
echo   - Press Ctrl + C to stop the server when done.
echo.

:: Open default browser after a 3-second delay to ensure Next.js has bound port 3000
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

call npm run start
pause

