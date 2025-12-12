#!/bin/bash

# WL-Drop Start Script
# Quick script to start the server

set -e

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run ./install.sh first"
    exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Start the server
echo "🚀 Starting WL-Drop server..."
python run.py
