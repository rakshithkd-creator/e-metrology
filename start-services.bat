@echo off
cd /d "c:\Users\Rakshith D\Desktop\36\backend"
start /b "" cmd /c "npm.cmd run dev > ..\backend.log 2>&1"
cd /d "c:\Users\Rakshith D\Desktop\36\frontend"
start /b "" cmd /c "npm.cmd run dev -- --host 0.0.0.0 > ..\frontend.log 2>&1"
