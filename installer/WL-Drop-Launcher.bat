@echo off
REM WL-Drop Launcher - Debug Mode
REM Shows console window for debugging

cd /d "%~dp0"

REM Set Python path
set PYTHON_HOME=%~dp0python
set PATH=%PYTHON_HOME%;%PYTHON_HOME%\Scripts;%PATH%

echo.
echo ============================================================
echo    WL-Drop - Debug Mode
echo ============================================================
echo.
echo Python Home: %PYTHON_HOME%
echo.

REM Check if Python exists
if not exist "%PYTHON_HOME%\python.exe" (
    echo ERROR: Python not found at %PYTHON_HOME%
    echo Please reinstall WL-Drop
    pause
    exit /b 1
)

echo Python found: %PYTHON_HOME%\python.exe
echo.

REM Create uploads directory if it doesn't exist
if not exist "uploads" (
    echo Creating uploads directory...
    mkdir uploads
)

REM Check if dependencies are installed
echo Checking dependencies...
"%PYTHON_HOME%\python.exe" -c "import fastapi" 2>nul
if errorlevel 1 (
    echo.
    echo Installing dependencies... This may take a minute.
    echo.
    "%PYTHON_HOME%\python.exe" -m pip install --no-warn-script-location -r requirements.txt
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
)

echo Dependencies OK
echo.

REM Start WL-Drop
echo Starting WL-Drop server...
echo.
echo ------------------------------------------------------------
"%PYTHON_HOME%\python.exe" run.py

REM If we get here, server stopped
echo.
echo ------------------------------------------------------------
echo Server stopped.
pause
