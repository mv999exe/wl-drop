@echo off
REM WL-Drop Build Script for Windows Distribution

echo ========================================
echo    WL-Drop Build Script
echo ========================================
echo.

REM Activate virtual environment
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    echo Please run install.bat first
    pause
    exit /b 1
)

REM Step 1: Build Frontend
echo.
echo Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo Frontend built successfully!
echo.

REM Step 2: Install PyInstaller if needed
echo Checking PyInstaller...
pip show pyinstaller >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PyInstaller...
    pip install pyinstaller
)
echo PyInstaller ready!
echo.

REM Step 3: Build executable
echo.
echo Building standalone executable...
pyinstaller --clean wl-drop.spec
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Executable built successfully!
echo.

REM Step 4: Create release package
echo.
echo Creating release package...
for /f "tokens=*" %%a in ('python -c "import json; print(json.load(open('package.json'))['version'])"') do set VERSION=%%a

set RELEASE_DIR=release\wl-drop-v%VERSION%-windows

if exist release rmdir /s /q release
mkdir "%RELEASE_DIR%"

REM Copy executable
copy dist\wl-drop.exe "%RELEASE_DIR%\"

REM Copy necessary files
copy README.md "%RELEASE_DIR%\"
copy LICENSE "%RELEASE_DIR%\"
copy QUICKSTART.md "%RELEASE_DIR%\"

REM Create simple run script
echo @echo off > "%RELEASE_DIR%\WL-Drop.bat"
echo cd /d "%%~dp0" >> "%RELEASE_DIR%\WL-Drop.bat"
echo start "" wl-drop.exe >> "%RELEASE_DIR%\WL-Drop.bat"
echo echo WL-Drop is starting... >> "%RELEASE_DIR%\WL-Drop.bat"
echo echo. >> "%RELEASE_DIR%\WL-Drop.bat"
echo echo Your browser should open automatically. >> "%RELEASE_DIR%\WL-Drop.bat"
echo echo If not, open: http://localhost:8000 >> "%RELEASE_DIR%\WL-Drop.bat"
echo echo. >> "%RELEASE_DIR%\WL-Drop.bat"
echo timeout /t 3 >> "%RELEASE_DIR%\WL-Drop.bat"
echo start http://localhost:8000 >> "%RELEASE_DIR%\WL-Drop.bat"

REM Create README for release
echo WL-Drop - Local File Sharing Application > "%RELEASE_DIR%\README.txt"
echo ========================================= >> "%RELEASE_DIR%\README.txt"
echo. >> "%RELEASE_DIR%\README.txt"
echo Quick Start: >> "%RELEASE_DIR%\README.txt"
echo 1. Double-click: WL-Drop.bat >> "%RELEASE_DIR%\README.txt"
echo 2. Browser opens automatically >> "%RELEASE_DIR%\README.txt"
echo 3. Share the Network URL with other devices >> "%RELEASE_DIR%\README.txt"
echo. >> "%RELEASE_DIR%\README.txt"
echo That's it! No installation required. >> "%RELEASE_DIR%\README.txt"
echo. >> "%RELEASE_DIR%\README.txt"
echo For detailed documentation, see README.md >> "%RELEASE_DIR%\README.txt"

echo Release package created!
echo.

REM Step 5: Create ZIP archive
echo Creating archive...
powershell -command "Compress-Archive -Path '%RELEASE_DIR%' -DestinationPath 'release\wl-drop-v%VERSION%-windows-x64.zip' -Force"

echo.
echo ========================================
echo    Build Complete!
echo ========================================
echo.
echo Release package: release\wl-drop-v%VERSION%-windows-x64.zip
echo.
echo Users can extract and run: WL-Drop.bat
echo No Python, Node.js, or dependencies needed!
echo.
pause
