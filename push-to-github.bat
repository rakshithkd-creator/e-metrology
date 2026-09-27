@echo off
setlocal
title Upload Full e-Metrology System to GitHub
set "GIT_EXE=C:\Users\Rakshith D\mingit\cmd\git.exe"

echo ========================================================
echo   Uploading FULL e-Metrology Code to GitHub
echo   Repository: https://github.com/rakshithd0111/e-Metrology
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Configuring Git Credential Manager...
"%GIT_EXE%" config credential.helper manager
"%GIT_EXE%" config user.name "rakshithd0111"
"%GIT_EXE%" config user.email "rakshithd0111@users.noreply.github.com"

echo [2/4] Staging backend, frontend, and all source files...
"%GIT_EXE%" add .

echo [3/4] Creating commit...
"%GIT_EXE%" commit -m "e-Metrology Full Stack Application" 2>nul

echo [4/4] Connecting to GitHub remote...
"%GIT_EXE%" remote remove origin 2>nul
"%GIT_EXE%" remote add origin https://github.com/rakshithd0111/e-Metrology.git

echo.
echo ========================================================
echo Pushing backend and frontend folders to GitHub...
echo (A browser window may open to click "Sign in with your browser")
echo ========================================================
echo.

"%GIT_EXE%" push --force -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo SUCCESS! Backend and frontend are now live on GitHub!
    echo Check it here: https://github.com/rakshithd0111/e-Metrology
    echo ========================================================
    echo.
    echo Now go back to Render and click "Manual Deploy" -> "Deploy latest commit"!
) else (
    echo ========================================================
    echo If GitHub asks for login, please sign in through the browser.
    echo ========================================================
)

pause
