#!/bin/bash

# WL-Drop Build Script for Distribution
# Creates a standalone executable with all dependencies

set -e

echo "╔════════════════════════════════════════╗"
echo "║   WL-Drop Build Script                 ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if running in virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "🔧 Activating virtual environment..."
    source .venv/bin/activate
fi

# Step 1: Build Frontend
echo "📦 Building frontend..."
npm run build
echo "✅ Frontend built successfully"
echo ""

# Step 2: Install PyInstaller if needed
echo "🔧 Checking PyInstaller..."
if ! pip show pyinstaller > /dev/null 2>&1; then
    echo "📦 Installing PyInstaller..."
    pip install pyinstaller
fi
echo "✅ PyInstaller ready"
echo ""

# Step 3: Build executable
echo "🏗️  Building standalone executable..."
pyinstaller --clean wl-drop.spec
echo "✅ Executable built successfully"
echo ""

# Step 4: Create release package
echo "📦 Creating release package..."
RELEASE_DIR="release/wl-drop-v$(python -c 'import json; print(json.load(open("package.json"))["version"])')-linux"
rm -rf release
mkdir -p "$RELEASE_DIR"

# Copy executable
cp dist/wl-drop "$RELEASE_DIR/"

# Copy necessary files
cp README.md "$RELEASE_DIR/"
cp LICENSE "$RELEASE_DIR/"
cp QUICKSTART.md "$RELEASE_DIR/"

# Create simple run script
cat > "$RELEASE_DIR/run.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./wl-drop
EOF
chmod +x "$RELEASE_DIR/run.sh"

# Create README for release
cat > "$RELEASE_DIR/README.txt" << 'EOF'
WL-Drop - Local File Sharing Application
=========================================

Quick Start:
1. Run: ./run.sh
2. Open browser: http://localhost:8000
3. Share the Network URL with other devices on same WiFi

That's it! No installation required.

For detailed documentation, see README.md
EOF

echo "✅ Release package created: $RELEASE_DIR"
echo ""

# Step 5: Create archive
echo "📦 Creating archive..."
cd release
tar -czf "wl-drop-v$(python -c 'import json; print(json.load(open("../package.json"))["version"])')-linux-x64.tar.gz" "wl-drop-v$(python -c 'import json; print(json.load(open("../package.json"))["version"])')-linux"
cd ..

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Build Complete!                   ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📦 Release package: release/wl-drop-v*-linux-x64.tar.gz"
echo ""
echo "Users can extract and run with: ./run.sh"
echo "No Python, Node.js, or dependencies needed!"
