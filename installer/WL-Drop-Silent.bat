@echo off
REM WL-Drop Silent Launcher
REM Runs System Tray application

cd /d "%~dp0"

REM Set Python path
set PYTHON_HOME=%~dp0python
set PATH=%PYTHON_HOME%;%PYTHON_HOME%\Scripts;%PATH%

REM Create uploads directory
if not exist "uploads" mkdir uploads 2>nul

REM Check and install dependencies silently if needed
"%PYTHON_HOME%\python.exe" -c "import fastapi, pystray" 2>nul
if errorlevel 1 (
    "%PYTHON_HOME%\python.exe" -m pip install --no-warn-script-location -q -r requirements.txt
)

REM Start System Tray application (no console window)
start "" "%PYTHON_HOME%\pythonw.exe" tray_app.py 2>nul
if errorlevel 1 (
    REM pythonw.exe not available in embedded Python, use workaround
    start "" /min "%PYTHON_HOME%\python.exe" tray_app.py
)

REM Exit this script (tray app keeps running)
exit
