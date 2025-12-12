"""
Main entry point for WL-Drop server
Run this script to start the server
"""

import sys
import asyncio
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn
from backend.core.config import settings
from backend.core.utils import get_local_ip


def main():
    """Run the WL-Drop server"""
    
    # Get local IP for display
    local_ip = get_local_ip()
    
    print("\n" + "="*60)
    print("⚡ WL-Drop - Local File Sharing Server")
    print("="*60)
    print(f"\n🌐 Server starting on:")
    print(f"   Local:   http://localhost:{settings.PORT}")
    print(f"   Network: http://{local_ip}:{settings.PORT}")
    print(f"\n📱 Other devices can connect using: http://{local_ip}:{settings.PORT}")
    print("\n💡 Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    # Run the server
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level="info"
    )


if __name__ == "__main__":
    main()
