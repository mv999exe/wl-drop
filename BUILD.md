# Building WL-Drop for Distribution

This guide is for developers who want to create standalone executables for distribution.

## Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- Virtual environment activated

## Build Process

### For Linux

```bash
# 1. Install dependencies (if not already done)
./install.sh

# 2. Build the distribution
./build.sh
```

This creates:
- `release/wl-drop-v*-linux-x64.tar.gz` - Ready for distribution

### For Windows

```cmd
# 1. Install dependencies (if not already done)
install.bat

# 2. Build the distribution
build.bat
```

This creates:
- `release/wl-drop-v*-windows-x64.zip` - Ready for distribution

## What Gets Included

The build process:
1. ✅ Builds the React frontend (`npm run build`)
2. ✅ Bundles Python backend with PyInstaller
3. ✅ Includes all dependencies (no external installation needed)
4. ✅ Creates a single executable file
5. ✅ Packages everything with simple run scripts

## Distribution Package Contents

```
wl-drop-v1.1.0/
├── wl-drop(.exe)      # Main executable (all-in-one)
├── run.sh / WL-Drop.bat  # Simple launcher
├── README.txt         # Quick start guide
├── README.md          # Full documentation
├── LICENSE
└── QUICKSTART.md
```

## Testing the Build

After building:

```bash
# Linux
cd release/wl-drop-v*/
./run.sh

# Windows
cd release\wl-drop-v*\
WL-Drop.bat
```

## Publishing Release

1. Build for all platforms (Linux, Windows, macOS)
2. Upload archives to GitHub Releases
3. Users download, extract, and run - no installation!

## Notes

- **No Python needed** by end users
- **No Node.js needed** by end users
- **No npm install** needed by end users
- **Just download, extract, run!**

## Troubleshooting

### Build fails on Windows
- Ensure virtual environment is activated
- Try: `pip install --upgrade pyinstaller`

### Build fails on Linux
- Ensure build tools: `sudo apt install build-essential`
- Try: `pip install --upgrade pyinstaller`

### Large executable size
- Normal! Includes Python runtime + all dependencies
- Typically 40-80 MB (acceptable for standalone app)

## For Developers Only

If you want to modify the source code:
1. Clone the repository
2. Run `install.sh` or `install.bat`
3. Develop with `npm run dev` (frontend) and `./start.sh` (backend)
4. When ready to distribute, run build scripts
