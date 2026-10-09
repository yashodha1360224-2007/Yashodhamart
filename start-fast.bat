@echo off
title YashodhaMart (Fast Production Mode)
cd /d "%~dp0"

echo ===================================================
echo     Starting YashodhaMart (Fast Production Mode)   
echo ===================================================
echo.
echo [1/2] Starting server...
start "" /b npm run start
echo.
echo [2/2] Waiting 3 seconds...
powershell -Command "Start-Sleep -Seconds 3"
echo.
echo Opening YashodhaMart at http://localhost:3000 ...
start http://localhost:3000
echo.
echo ===================================================
echo  YashodhaMart is running in FAST Mode!
echo  All pages load instantly.
echo  Keep this window OPEN while using the site.
echo ===================================================
echo.

powershell -Command "while ($true) { Start-Sleep -Seconds 60 }"
