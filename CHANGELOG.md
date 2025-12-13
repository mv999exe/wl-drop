# Changelog

All notable changes to WL-Drop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-12-13

### Added
- 💓 **Heartbeat Auto-Shutdown** - Server automatically shuts down 10 seconds after browser tab closes
- 🔄 Frontend sends heartbeat every 2 seconds to keep server alive
- 🛑 No more manual server shutdown needed - just close the browser tab!
- ⚡ 30-second grace period on startup for initial connection

### Changed
- 🎯 Simplified auto-shutdown mechanism using heartbeat instead of process monitoring
- 🧹 Removed psutil dependency - no longer needed
- 📦 Smaller dependency footprint for faster installation

### Technical Details
- Backend monitors last heartbeat timestamp
- Frontend POST to `/api/heartbeat` every 2 seconds
- Server shuts down gracefully after 10 seconds of no heartbeat
- Cleanup on tab close/unmount stops heartbeat automatically

## [1.1.0] - 2025-12-13

### Changed
- 🗑️ **BREAKING**: Files are now deleted immediately after successful download
- ♻️ Replaced time-based cleanup service with instant cleanup after transfer completion
- 🎯 More professional approach: no files left behind after successful transfers
- 🔧 Simplified cleanup service to manual utilities only

### Added
- ☕ Buy Me a Coffee support button with working link
- 🪟 **Professional Windows Installer** - Inno Setup based installer for Windows
- 🐧 **Linux .deb Package** - Professional Debian package for Linux
- 🎨 **System Tray Application** - Professional background app with icon in system tray
- 🔇 **Silent Background Operation** - No CMD window visible to users
- 🔄 **Smart Auto-Shutdown** - Server monitors active browser tabs and stops when last tab closes
- 🎯 **Tray Menu** - Start/Stop server, Open browser, Exit - all from system tray
- 🖼️ **Professional Icon** - Custom WL-Drop logo (.ico + .png)
- 📦 **Distribution Build System** - Create standalone executables for Windows & Linux
- 🛠️ build.sh and build.bat scripts for building distributions
- 📖 BUILD.md - Comprehensive build documentation
- 🚀 Pre-built installers available in Releases (no Python/Node.js needed!)
- 📚 Updated documentation with clear sections for end users vs developers
- 🤖 GitHub Actions workflow for automated release builds

### Fixed
- 🔗 Buy Me a Coffee button now links to https://buymeacoffee.com/mv999exe
- 🐍 Embedded Python pip installation in Windows installer
- 💾 Dependencies now install correctly during installation
- 🪟 pythonw.exe issue in embedded Python (replaced with VBScript + tray app)

### Removed
- ❌ Automatic hourly cleanup service (replaced with instant cleanup)
- ❌ AUTO_CLEANUP_HOURS configuration setting (no longer needed)

### Technical Details
- **System Tray App**: pystray-based application with professional UI
- **Smart Monitoring**: Checks for active browser connections every 2 seconds
- **Grace Period**: 10-second grace period before auto-shutdown (prevents false positives)
- **Health Check**: /api/health endpoint for monitoring
- Background tasks now handle cleanup after each download
- Transfer directories deleted immediately upon successful file download
- Reduced server maintenance overhead
- Cleaner uploads folder management
- VBScript launcher for silent Windows operation (no console windows)
- Browser tab monitoring for intelligent auto-shutdown
- Embedded Python 3.11.9 with proper pip installation
- get-pip.py integration for embedded Python environments
- Modified python311._pth to enable site-packages
- Inno Setup installer with download wizard for Python runtime
- GitHub Actions workflow for automated releases
- Multi-size .ico icon (16x16 to 256x256)

### For End Users
- 📥 Download ready-to-use installers from [Releases](https://github.com/mv999exe/wl-drop/releases)
- 🪟 Windows: Run setup.exe installer
  - Installs to Program Files like normal software
  - Creates system tray icon - NO console windows!
  - Auto-starts server when clicked
  - Auto-stops when you close browser
  - Professional icon in system tray with Start/Stop menu
- 🐧 Linux: Install .deb package with `sudo dpkg -i wl-drop*.deb`
- ✨ No technical knowledge required - just install and use!
- 🔇 Runs completely silently in background
- 🔄 Smart auto-stop when you close the browser tab

### For Developers
- 🔨 Use `./build.sh` (Linux) or `build.bat` (Windows) to create distributions
- 📖 See BUILD.md for detailed build instructions
- 🛠️ Full source code available for modifications
- 🎨 System tray app: `tray_app.py` with pystray
- 🖼️ Icon generator: `create_icon.py`

---

## [1.0.0] - 2025-12-13

### Added
- 🎉 Initial release of WL-Drop
- ⚡ FastAPI backend server with async file operations
- 🔌 WebSocket support for real-time device discovery
- 📁 File upload with drag & drop support
- 📂 Folder upload capability
- 📥 File download as ZIP archives
- 🔍 Automatic device discovery on local network
- 💻 Cross-platform support (Windows, Linux, macOS)
- 🎨 Modern, responsive UI built with React
- 🔒 Filename sanitization for security
- 🧹 Automatic cleanup service for old files
- 📊 RESTful API with comprehensive endpoints
- 📖 Comprehensive documentation (README, QUICKSTART, ARCHITECTURE)
- 🚀 Easy installation scripts for all platforms
- ⚙️ Configurable settings via .env file
- 🔗 WebSocket-based real-time notifications
- 👥 Device profile management
- 📱 Mobile browser support

### Technical Details
- **Backend**: FastAPI 0.109+, Uvicorn, WebSockets, Pydantic
- **Frontend**: React 19.2, TypeScript 5.8, Vite 6.2
- **APIs**: 15+ REST endpoints, WebSocket protocol
- **Security**: Path traversal prevention, filename sanitization
- **Performance**: Async I/O, chunked uploads, efficient compression

---

## [Unreleased]

### Planned for v1.1.0
- Transfer progress indicators
- Transfer history log
- Resume interrupted transfers
- File preview before download
- Improved error messages
- Dark/light theme toggle

### Planned for v1.2.0
- End-to-end encryption
- Optional password protection
- QR code for easy connection
- Transfer speed optimization
- Bandwidth throttling option

### Planned for v2.0.0
- Desktop application (PyInstaller)
- Mobile native app
- Multi-language support (i18n)
- Plugin system
- Advanced file filtering

---

## Version History

### [1.0.0] - 2025-12-13
First stable release with core features.

---

## Categories

### Added
New features added to the project.

### Changed
Changes in existing functionality.

### Deprecated
Features that will be removed in upcoming releases.

### Removed
Features that have been removed.

### Fixed
Bug fixes.

### Security
Security improvements or vulnerability fixes.

---

**Note**: This project is actively maintained. Check the [GitHub repository](https://github.com/mv999exe/wl-drop) for the latest updates.
