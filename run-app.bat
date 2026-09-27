@echo off
echo ========================================================
echo   Starting e-Metrology System (Backend + Frontend)
echo ========================================================
echo.

start "e-Metrology Backend Server (Port 5000)" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "e-Metrology Frontend Portal (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching:
echo   - Frontend Portal: http://localhost:5173
echo   - Backend REST API: http://localhost:5000/api
echo.
pause
