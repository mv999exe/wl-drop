@echo off
REM WL-Drop Silent Launcher
REM Runs in background without console window

cd /d "%~dp0"

REM Set Python path
set PYTHON_HOME=%~dp0python
set PATH=%PYTHON_HOME%;%PYTHON_HOME%\Scripts;%PATH%

REM Create uploads directory
if not exist "uploads" mkdir uploads 2>nul

REM Check and install dependencies silently if needed
"%PYTHON_HOME%\python.exe" -c "import fastapi" 2>nul
if errorlevel 1 (
    "%PYTHON_HOME%\python.exe" -m pip install --no-warn-script-location -q -r requirements.txt
)

REM Start server in background using pythonw.exe (no console window)
REM pythonw.exe doesn't create a console window at all
start "" "%PYTHON_HOME%\pythonw.exe" run.py

REM Wait for server to start (2 seconds)
ping 127.0.0.1 -n 3 >nul

REM Open browser
start http://localhost:8000

REM Exit this script (server keeps running via pythonw.exe)
exit
