@echo off
REM WL-Drop Launcher
REM This script launches WL-Drop using the embedded Python

cd /d "%~dp0"

REM Set Python path
set PYTHON_HOME=%~dp0python
set PATH=%PYTHON_HOME%;%PYTHON_HOME%\Scripts;%PATH%

REM Create uploads directory if it doesn't exist
if not exist "uploads" mkdir uploads

REM Start WL-Drop
echo.
echo ============================================================
echo    Starting WL-Drop...
echo ============================================================
echo.

start "" "%PYTHON_HOME%\python.exe" run.py

REM Wait a bit for server to start
timeout /t 3 /nobreak >nul

REM Open browser
start http://localhost:8000

echo.
echo WL-Drop is running!
echo Your browser should open automatically.
echo.
echo If not, open: http://localhost:8000
echo.
echo Press Ctrl+C in the Python window to stop the server.
echo.
