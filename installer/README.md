# WL-Drop Windows Installer Guide

## For End Users (Non-Technical)

### Installation Steps

1. **Download** `wl-drop-v1.1.0-windows-setup.exe` from [Releases](https://github.com/mv999exe/wl-drop/releases)

2. **Run** the installer (double-click the downloaded file)

3. **Follow** the installation wizard:
   - Click "Next"
   - Choose installation location (default: `C:\Program Files\WL-Drop`)
   - Select "Create desktop icon" if you want
   - Click "Install"
   - Wait for installation to complete

4. **Done!** WL-Drop is now installed on your computer

### First Time Use

After installation:
- Find "WL-Drop" icon on your Desktop or in Start Menu
- Double-click to launch
- Your browser opens automatically
- Start sharing files!

### What Gets Installed

The installer will:
- ✅ Install WL-Drop in Program Files
- ✅ Download and install Python (embedded, no conflicts)
- ✅ Install all required dependencies automatically
- ✅ Create Desktop shortcut
- ✅ Add Start Menu entry
- ✅ Create uninstaller

**Total size**: ~50-70 MB (includes everything needed)

### Uninstallation

To remove WL-Drop:
1. Go to Windows Settings > Apps
2. Find "WL-Drop" in the list
3. Click "Uninstall"

Or use Start Menu > WL-Drop > Uninstall WL-Drop

---

## For Developers

### Building the Installer

#### Requirements:
- Windows 10/11
- [Inno Setup 6](https://jrsoftware.org/isdl.php)
- Python 3.11+
- Node.js 18+

#### Build Steps:

```powershell
# Method 1: Using PowerShell Script (Recommended)
.\installer\build-installer.ps1

# Method 2: Manual Build
# 1. Build frontend
npm run build

# 2. Download Python Embedded
# (Script does this automatically)

# 3. Compile with Inno Setup
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer\wl-drop-setup.iss
```

### Installer Components

The installer includes:
- **Python Embedded** (3.11.9): Portable Python runtime (~10MB)
- **Application Files**: Frontend + Backend code
- **Dependencies**: Installed via pip during setup
- **Launcher Script**: Starts the server and opens browser
- **Shortcuts**: Desktop + Start Menu

### Configuration

Edit `installer/wl-drop-setup.iss` to customize:
- App version
- Installation path
- Icons
- Shortcuts
- File associations

### Testing

After building:
1. Run the installer in a clean VM
2. Test installation process
3. Launch the app
4. Test file sharing
5. Test uninstallation

---

## Advantages of Installer vs Portable EXE

### Installer Approach (Current)
✅ **Professional**: Like any Windows software  
✅ **Proper Uninstall**: Via Windows Settings  
✅ **Start Menu Integration**: Easy to find and launch  
✅ **Desktop Shortcut**: Quick access  
✅ **Auto-updates** (future): Can check for updates  
✅ **User Familiar**: Standard installation process  

### Portable EXE (Old)
❌ Large single file (50+ MB)  
❌ No integration with Windows  
❌ No proper uninstall  
❌ Antivirus issues  
❌ No auto-update mechanism  

---

## Technical Details

### Directory Structure After Installation

```
C:\Program Files\WL-Drop\
├── python\              # Embedded Python runtime
│   ├── python.exe
│   ├── python311.dll
│   └── ...
├── dist\                # Frontend build
│   ├── index.html
│   └── assets\
├── backend\             # Python backend
│   ├── main.py
│   ├── api\
│   └── ...
├── uploads\             # Uploaded files (temp)
├── run.py              # Main entry point
├── requirements.txt    # Python dependencies
├── WL-Drop-Launcher.bat # Launch script
├── logo.ico
├── README.md
└── LICENSE
```

### How It Works

1. **Installation**: Inno Setup extracts files and downloads Python
2. **Dependencies**: Pip installs required packages
3. **Launch**: Launcher script:
   - Sets Python path
   - Creates uploads directory
   - Starts FastAPI server
   - Opens browser

### Security

- Code signing (future): Will sign with valid certificate
- No admin required after installation
- Runs on user level
- Firewall prompt on first run (normal for servers)

---

## Troubleshooting

### Installer won't run
- Check antivirus settings
- Download again (file may be corrupted)
- Run as Administrator

### App won't start
- Check if port 8000 is available
- Look for error in console window
- Check firewall settings

### Browser doesn't open
- Manually open: http://localhost:8000
- Check if server started (console window)

### Dependencies fail to install
- Check internet connection
- Firewall may block pip downloads
- Try running as Administrator

---

## Future Improvements

- [ ] Code signing certificate
- [ ] Auto-update mechanism
- [ ] Silent install option
- [ ] Custom port selection during install
- [ ] Run as Windows Service option
- [ ] System tray integration
