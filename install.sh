#!/bin/bash

# WL-Drop Installation Script
# This script will install all dependencies and set up the project

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║   WL-Drop Installation Script          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check Python version
echo "📋 Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python $PYTHON_VERSION found"

# Check Node.js (optional for frontend development)
echo ""
echo "📋 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js $NODE_VERSION found"
    HAS_NODE=true
else
    echo "⚠️  Node.js not found (optional - needed only for frontend development)"
    HAS_NODE=false
fi

# Create virtual environment
echo ""
echo "🔧 Creating Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install PyInstaller for building distributions
echo "📦 Installing PyInstaller (for building executables)..."
pip install pyinstaller

echo "✅ Python dependencies installed"

# Install Node.js dependencies and build frontend (if Node.js is available)
if [ "$HAS_NODE" = true ]; then
    echo ""
    echo "📦 Installing Node.js dependencies..."
    npm install
    echo "✅ Node.js dependencies installed"
    
    echo ""
    echo "🏗️  Building frontend..."
    npm run build
    echo "✅ Frontend built successfully"
else
    echo ""
    echo "⚠️  Skipping frontend build (Node.js not installed)"
    echo "   You can use the pre-built version or install Node.js later"
fi

# Create uploads directory
echo ""
echo "📁 Creating uploads directory..."
mkdir -p uploads
echo "✅ Uploads directory created"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo ""
    echo "✅ .env file already exists"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Installation Complete! 🎉            ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "To start the server, run:"
echo "  source .venv/bin/activate  # Activate virtual environment"
echo "  python run.py              # Start server"
echo ""
echo "Or simply:"
echo "  ./start.sh"
echo ""
echo "The server will be available at http://localhost:8000"
echo "Check the terminal output for your network IP address."
echo ""
