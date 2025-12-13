# WL-Drop v1.1.0 Release Notes

## 🎯 Instant File Cleanup

This release introduces a more professional approach to file management: **files are now deleted immediately after successful download**.

### ✨ What's New

#### Changed
- 🗑️ **Instant Cleanup**: Files are deleted immediately after successful download (no more waiting periods)
- ♻️ **Smarter Approach**: Replaced time-based cleanup with event-based cleanup
- 🎯 **Professional**: No files left behind after successful transfers
- 🔧 **Simplified**: Cleanup service reduced to manual utilities only

#### Removed
- ❌ Automatic hourly cleanup service (replaced with instant cleanup)
- ❌ `AUTO_CLEANUP_HOURS` configuration setting (no longer needed)

### 🔧 Technical Improvements

- Background tasks handle cleanup after each download
- Transfer directories deleted upon successful file download completion
- Reduced server maintenance overhead
- Cleaner uploads folder management
- No more scheduled cleanup jobs

### 📦 Installation

#### Linux/macOS:
```bash
git clone https://github.com/mv999exe/wl-drop.git
cd wl-drop
./install.sh
./start.sh
```

#### Windows:
```cmd
git clone https://github.com/mv999exe/wl-drop.git
cd wl-drop
install.bat
start.bat
```

### 🚀 What This Means For You

- **Users**: Files are automatically cleaned up after download - no manual cleanup needed
- **Server admins**: Less disk usage, no old files accumulating
- **Developers**: Simpler codebase, more maintainable

### 📝 Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for complete details.

### 🐛 Bug Reports & Feature Requests

Please open an issue on [GitHub](https://github.com/mv999exe/wl-drop/issues).

---

**Full Version**: v1.1.0  
**Release Date**: December 13, 2025  
**Previous Version**: v1.0.0
