@echo off
echo ========================================================
echo   Re-seeding e-Metrology Database with Demo Data
echo ========================================================
echo.
cd backend
npx prisma db push
npx tsx prisma/seed.ts
echo.
pause
