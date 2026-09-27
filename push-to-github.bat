@echo off
setlocal
title Push e-Metrology to GitHub
set "GIT_EXE=C:\Users\Rakshith D\mingit\cmd\git.exe"

echo ========================================================
echo   Push e-Metrology to GitHub (rakshithd0111)
echo ========================================================
echo.

cd /d "%~dp0"

if not exist .git (
    echo [1/4] Initializing Git repository...
    "%GIT_EXE%" init
    "%GIT_EXE%" branch -M main
    "%GIT_EXE%" config user.name "rakshithd0111"
    "%GIT_EXE%" config user.email "rakshithd0111@users.noreply.github.com"
)

echo [2/4] Staging project files...
"%GIT_EXE%" add .

echo [3/4] Creating commit...
"%GIT_EXE%" commit -m "e-Metrology Digital Legal Metrology System"

echo.
echo [4/4] Setting remote repository...
"%GIT_EXE%" remote remove origin 2>nul
"%GIT_EXE%" remote add origin https://github.com/rakshithd0111/e-metrology.git

echo.
echo ========================================================
echo Ready to push to: https://github.com/rakshithd0111/e-metrology.git
echo ========================================================
echo.
"%GIT_EXE%" push -u origin main

echo.
if %errorlevel% neq 0 (
    echo If push failed, make sure you created the repository 'e-metrology' on GitHub first!
)
pause
