@echo off
REM WL-Drop Installation Script for Windows

echo ========================================
echo    WL-Drop Installation Script
echo ========================================
echo.

REM Check Python
echo Checking Python version...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo Python found!
echo.

REM Create virtual environment
echo Creating Python virtual environment...
if not exist ".venv" (
    python -m venv .venv
    echo Virtual environment created!
) else (
    echo Virtual environment already exists!
)
echo.

REM Activate virtual environment and install dependencies
echo Installing Python dependencies...
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Install PyInstaller for building distributions
echo Installing PyInstaller (for building executables)...
pip install pyinstaller

echo Python dependencies installed!
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js found!
    echo.
    
    echo Installing Node.js dependencies...
    call npm install
    echo Node.js dependencies installed!
    echo.
    
    echo Building frontend...
    call npm run build
    echo Frontend built successfully!
) else (
    echo Node.js not found - skipping frontend build
    echo You can use the pre-built version or install Node.js later
)
echo.

REM Create uploads directory
echo Creating uploads directory...
if not exist "uploads" mkdir uploads
echo Uploads directory created!
echo.

REM Create .env file
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created!
) else (
    echo .env file already exists!
)
echo.

echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo To start the server, run: start.bat
echo.
pause
