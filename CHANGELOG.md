# Changelog

All notable changes to WL-Drop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-13

### Changed
- 🗑️ **BREAKING**: Files are now deleted immediately after successful download
- ♻️ Replaced time-based cleanup service with instant cleanup after transfer completion
- 🎯 More professional approach: no files left behind after successful transfers
- 🔧 Simplified cleanup service to manual utilities only

### Added
- ☕ Buy Me a Coffee support button with working link
- 📦 **Distribution Build System** - Create standalone executables for Windows & Linux
- 🛠️ build.sh and build.bat scripts for building distributions
- 📖 BUILD.md - Comprehensive build documentation
- 🚀 Pre-built executables available in Releases (no Python/Node.js needed!)
- 📚 Updated documentation with clear sections for end users vs developers

### Fixed
- 🔗 Buy Me a Coffee button now links to https://buymeacoffee.com/mv999exe

### Removed
- ❌ Automatic hourly cleanup service (replaced with instant cleanup)
- ❌ AUTO_CLEANUP_HOURS configuration setting (no longer needed)

### Technical Details
- Background tasks now handle cleanup after each download
- Transfer directories deleted immediately upon successful file download
- Reduced server maintenance overhead
- Cleaner uploads folder management
- PyInstaller integration for creating standalone executables
- Enhanced .spec file with all required dependencies
- GitHub Actions workflow for automated releases

### For End Users
- 📥 Download ready-to-use executables from [Releases](https://github.com/mv999exe/wl-drop/releases)
- 🪟 Windows: Extract ZIP and run `WL-Drop.bat`
- 🐧 Linux: Extract tar.gz and run `./run.sh`
- ✨ No installation, no Python, no Node.js required!

### For Developers
- 🔨 Use `./build.sh` (Linux) or `build.bat` (Windows) to create distributions
- 📖 See BUILD.md for detailed build instructions
- 🛠️ Full source code available for modifications

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
