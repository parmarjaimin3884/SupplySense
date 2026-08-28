@echo off
cd /d "%~dp0SupplySense_Backend"
echo ========================================
echo   Starting SupplySense Backend Server
echo ========================================
echo.
.\venv\Scripts\python.exe main.py
pause
