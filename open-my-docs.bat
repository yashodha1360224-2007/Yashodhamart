@echo off
title Open YashodhaMart Capstone Documents
cd /d "%~dp0"

echo ===================================================
echo     Opening YashodhaMart Capstone Project Files    
echo ===================================================
echo.
echo [1/3] Opening PowerPoint Presentation (.pptx)...
start "" "YashodhaMart_Capstone_Presentation.pptx"
echo.
echo [2/3] Opening Presentation PDF (.pdf)...
start "" "YashodhaMart_Capstone_Presentation.pdf"
echo.
echo [3/3] Opening Capstone Documentation PDF (.pdf)...
start "" "YashodhaMart_Capstone_Documentation.pdf"
echo.
echo Opening Project Folder in File Explorer...
start explorer.exe "%~dp0"
echo.
echo All files opened successfully!
timeout /t 3 >nul
