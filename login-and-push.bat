@echo off
title Push e-Metrology to GitHub
echo ========================================================
echo   Connecting to GitHub (rakshithd0111/e-Metrology)
echo ========================================================
echo.

set "GH=C:\Program Files\GitHub CLI\gh.exe"
set "GIT=C:\Users\Rakshith D\mingit\cmd\git.exe"

cd /d "%~dp0"

echo [1/3] Logging into GitHub...
echo.
echo A code will be shown below and your browser will open.
echo Enter the code in your browser and click "Authorize github".
echo.
"%GH%" auth login --web -h github.com -p https

echo.
echo [2/3] Configuring Git with your GitHub credentials...
"%GH%" auth setup-git

echo.
echo [3/3] Uploading backend, frontend, and all project files...
"%GIT%" push --force -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo SUCCESS! Backend and Frontend are now LIVE on GitHub!
    echo Check: https://github.com/rakshithd0111/e-Metrology
    echo ========================================================
    echo.
    echo Go back to Render and click "Manual Deploy" -> "Deploy latest commit"!
) else (
    echo.
    echo If push failed, make sure you authorized in the browser.
)
pause
