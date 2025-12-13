"""
Main entry point for WL-Drop server
Run this script to start the server
"""

import sys
import os
import asyncio
import signal
import threading
import time
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn
from backend.core.config import settings
from backend.core.utils import get_local_ip


def check_browser_running():
    """Check if browser is still running (Windows only)"""
    if sys.platform != "win32":
        return True
    
    try:
        import psutil
        # Check for common browser processes
        browsers = ['chrome.exe', 'firefox.exe', 'msedge.exe', 'brave.exe', 'opera.exe']
        for proc in psutil.process_iter(['name']):
            if proc.info['name'] and proc.info['name'].lower() in browsers:
                return True
        return False
    except:
        return True  # If check fails, assume browser is running


def monitor_browser(server):
    """Monitor browser and shutdown server when browser closes"""
    if sys.platform != "win32":
        return
    
    # Wait for browser to start
    time.sleep(5)
    
    # Check every 5 seconds if browser is still running
    browser_was_running = False
    while True:
        time.sleep(5)
        browser_running = check_browser_running()
        
        if browser_was_running and not browser_running:
            print("\n🛑 Browser closed - shutting down server...")
            os.kill(os.getpid(), signal.SIGTERM)
            break
        
        browser_was_running = browser_running or browser_was_running


def main():
    """Run the WL-Drop server"""
    
    # Install psutil if needed (for browser monitoring on Windows)
    if sys.platform == "win32":
        try:
            import psutil
        except ImportError:
            print("📦 Installing browser monitoring support...")
            os.system(f"{sys.executable} -m pip install psutil -q")
            import psutil
        
        # Start browser monitor thread
        monitor_thread = threading.Thread(target=monitor_browser, args=(None,), daemon=True)
        monitor_thread.start()
    
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
    if sys.platform == "win32":
        print("🔄 Server will auto-stop when browser closes")
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
