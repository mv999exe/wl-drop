@echo off
REM WL-Drop Start Script for Windows

echo Starting WL-Drop server...
echo.

REM Check if virtual environment exists
if not exist ".venv" (
    echo ERROR: Virtual environment not found!
    echo Please run install.bat first
    pause
    exit /b 1
)

REM Activate virtual environment and start server
call .venv\Scripts\activate.bat
python run.py

pause
