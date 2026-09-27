@echo off
title e-Metrology - Digital Legal Metrology System
echo ========================================================
echo   e-Metrology: Digital Legal Metrology Portal
echo   Department of Consumer Affairs, Government of India
echo ========================================================
echo.

cd /d "%~dp0backend"

echo [1/3] Starting Unified e-Metrology Server on Port 3000...
start "e-Metrology Server (Port 3000)" cmd /k "node dist/index.js"

timeout /t 3 /nobreak >nul

echo [2/3] Opening Browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo [3/3] Choose Internet Sharing Mode:
echo   1. Cloudflare Tunnel (Recommended - No password, instant)
echo   2. LocalTunnel (Fixed URL: https://emetrology-portal.loca.lt)
echo   3. Local Network Only (http://localhost:3000)
echo ========================================================
echo.
set /p choice="Enter your choice (1, 2, or 3) [default=1]: "

if "%choice%"=="2" (
    echo.
    echo Starting LocalTunnel...
    echo Visit: https://emetrology-portal.loca.lt
    npx --yes localtunnel --port 3000 --subdomain emetrology-portal
) else if "%choice%"=="3" (
    echo.
    echo Server is running locally on:
    echo   - PC:       http://localhost:3000
    echo   - Wi-Fi:    http://10.65.148.150:3000
    echo Do not close this window while using the application.
    pause
) else (
    echo.
    echo Starting Cloudflare Tunnel...
    echo Look for the https://*.trycloudflare.com link below:
    echo.
    npx --yes cloudflared tunnel --url http://localhost:3000
)

pause
