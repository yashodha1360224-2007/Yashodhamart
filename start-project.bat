@echo off
title YashodhaMart Server
cd /d "%~dp0"

echo ===================================================
echo             Starting YashodhaMart Server           
echo ===================================================
echo.
echo [1/2] Launching server in the background...
start "" /b npm run dev
echo.
echo [2/2] Waiting 5 seconds for Next.js to compile...
powershell -Command "Start-Sleep -Seconds 5"
echo.
echo Opening YashodhaMart at http://localhost:3000 ...
start http://localhost:3000
echo.
echo ===================================================
echo  YashodhaMart is now running!
echo  Keep this window OPEN while using the website.
echo  To stop the server, press Ctrl+C or close this window.
echo ===================================================
echo.

:: Keep window alive and monitor process
powershell -Command "while ($true) { Start-Sleep -Seconds 60 }"

