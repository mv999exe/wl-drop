# WL-Drop Windows Installer Build Script
# This script creates a Windows installer using Inno Setup

# Requirements:
# - Inno Setup 6 installed
# - Python 3.11+ installed
# - Node.js installed

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  WL-Drop Windows Installer Builder" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "[1/5] Building Frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Prepare Python Embedded (Download if needed)
Write-Host "[2/5] Preparing Python Embedded..." -ForegroundColor Yellow
$pythonEmbedUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip"
$pythonEmbedZip = "build\python-embed.zip"
$pythonEmbedDir = "build\python-embed"

if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
}

if (-not (Test-Path $pythonEmbedDir)) {
    Write-Host "Downloading Python Embedded..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $pythonEmbedUrl -OutFile $pythonEmbedZip
    Expand-Archive -Path $pythonEmbedZip -DestinationPath $pythonEmbedDir -Force
    Remove-Item $pythonEmbedZip
    
    # Enable pip in embedded Python
    $pthFile = Get-ChildItem -Path $pythonEmbedDir -Filter "*._pth" | Select-Object -First 1
    if ($pthFile) {
        $content = Get-Content $pthFile.FullName
        $content = $content -replace '#import site', 'import site'
        Set-Content $pthFile.FullName $content
    }
    
    # Download get-pip.py
    Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile "$pythonEmbedDir\get-pip.py"
    & "$pythonEmbedDir\python.exe" "$pythonEmbedDir\get-pip.py"
    Remove-Item "$pythonEmbedDir\get-pip.py"
}
Write-Host "✓ Python Embedded ready" -ForegroundColor Green
Write-Host ""

# Step 3: Create logo.ico if not exists
Write-Host "[3/5] Preparing Assets..." -ForegroundColor Yellow
if (-not (Test-Path "assets\logo.ico")) {
    Write-Host "Warning: logo.ico not found in assets folder" -ForegroundColor Yellow
    Write-Host "You can convert logo.svg to logo.ico using an online tool" -ForegroundColor Yellow
}
Write-Host "✓ Assets ready" -ForegroundColor Green
Write-Host ""

# Step 4: Build with Inno Setup
Write-Host "[4/5] Building Installer with Inno Setup..." -ForegroundColor Yellow
$innoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"

if (-not (Test-Path $innoSetupPath)) {
    Write-Host "Error: Inno Setup not found!" -ForegroundColor Red
    Write-Host "Please install Inno Setup 6 from: https://jrsoftware.org/isdl.php" -ForegroundColor Yellow
    exit 1
}

& $innoSetupPath "installer\wl-drop-setup.iss"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Installer build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Installer built successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Summary
Write-Host "[5/5] Build Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✓ Build Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installer created:" -ForegroundColor Yellow
Get-ChildItem -Path "release\wl-drop-v*-windows-setup.exe" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor White
    Write-Host "  Size: $([math]::Round($_.Length / 1MB, 2)) MB" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Users can now:" -ForegroundColor Yellow
Write-Host "  1. Download the setup file" -ForegroundColor White
Write-Host "  2. Run it" -ForegroundColor White
Write-Host "  3. Follow the installation wizard" -ForegroundColor White
Write-Host "  4. WL-Drop will be installed in Program Files" -ForegroundColor White
Write-Host "  5. Desktop shortcut and Start Menu entry created" -ForegroundColor White
Write-Host ""
