"""
WL-Drop System Tray Application
Simple and reliable background app with server control
"""

import sys
import os
import subprocess
import time
import threading
import webbrowser
from pathlib import Path

try:
    import pystray
    from PIL import Image
except ImportError:
    print("📦 Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "pystray", "Pillow"])
    import pystray
    from PIL import Image


class WLDropTray:
    def __init__(self):
        self.server_process = None
        self.icon = None
        self.is_running = False
        self.base_url = "http://localhost:8000"
        
        # Setup paths
        self.script_dir = Path(__file__).parent
        self.python_exe = self.script_dir / "python" / "python.exe"
        
        # Use system Python if embedded not found (development mode)
        if not self.python_exe.exists():
            self.python_exe = Path(sys.executable)
        
    def load_icon_image(self):
        """Load the official WL-Drop logo"""
        try:
            script_dir = Path(__file__).parent
            logo_path = script_dir / "logo.png"
            
            if logo_path.exists():
                image = Image.open(logo_path)
                # Resize to appropriate size for system tray
                image = image.resize((64, 64), Image.Resampling.LANCZOS)
                return image
            else:
                raise FileNotFoundError("logo.png not found")
        except Exception as e:
            print(f"⚠️ Could not load logo: {e}")
            # Create simple fallback icon
            return self.create_fallback_icon()
    
    def create_fallback_icon(self):
        """Create a simple fallback icon if logo is missing"""
        image = Image.new('RGBA', (64, 64), (99, 102, 241, 255))
        return image
    
    def check_and_install_dependencies(self):
        """Check if dependencies are installed, install if missing"""
        try:
            print("🔍 Checking dependencies...")
            
            # Try importing fastapi
            result = subprocess.run(
                [str(self.python_exe), "-c", "import fastapi"],
                capture_output=True,
                timeout=5
            )
            
            if result.returncode != 0:
                print("📦 Installing dependencies... This may take a minute.")
                
                # Install requirements
                requirements_file = self.script_dir / "requirements.txt"
                if requirements_file.exists():
                    install_result = subprocess.run(
                        [str(self.python_exe), "-m", "pip", "install", 
                         "--no-warn-script-location", "-r", str(requirements_file)],
                        capture_output=True,
                        timeout=120
                    )
                    
                    if install_result.returncode != 0:
                        error_msg = install_result.stderr.decode() if install_result.stderr else ""
                        print(f"❌ Failed to install dependencies: {error_msg}")
                        return False
                    
                    print("✅ Dependencies installed successfully")
                else:
                    print("⚠️ requirements.txt not found")
                    return False
            else:
                print("✅ Dependencies OK")
            
            return True
            
        except Exception as e:
            print(f"❌ Error checking dependencies: {e}")
            return False
    
    def start_server(self, icon=None, item=None):
        """Start the WL-Drop server"""
        if self.server_process and self.server_process.poll() is None:
            print("⚠️ Server already running")
            return
        
        try:
            # Check and install dependencies first
            if not self.check_and_install_dependencies():
                print("❌ Cannot start server: dependency check failed")
                self.is_running = False
                self.update_icon_menu()
                return
            
            # Create uploads directory
            uploads_dir = self.script_dir / "uploads"
            uploads_dir.mkdir(exist_ok=True)
            
            print("🚀 Starting WL-Drop server...")
            
            # Start uvicorn directly - more professional and reliable
            cmd = [
                str(self.python_exe),
                "-m", "uvicorn",
                "backend.main:app",
                "--host", "0.0.0.0",
                "--port", "8000",
                "--log-level", "info"
            ]
            
            # Start server process (hidden on Windows)
            if sys.platform == "win32":
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startupinfo.wShowWindow = 0  # SW_HIDE
                
                self.server_process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    startupinfo=startupinfo,
                    creationflags=subprocess.CREATE_NO_WINDOW,
                    cwd=str(self.script_dir)
                )
            else:
                self.server_process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=str(self.script_dir)
                )
            
            # Wait a bit and verify server actually started
            time.sleep(1)
            if self.server_process.poll() is not None:
                # Process died immediately - read error
                stdout, stderr = self.server_process.communicate(timeout=1)
                error_msg = stderr.decode() if stderr else stdout.decode()
                print(f"❌ Server failed to start: {error_msg}")
                self.server_process = None
                self.is_running = False
                self.update_icon_menu()
                return
            
            # Server is running
            self.is_running = True
            self.update_icon_menu()
            print("✅ Server started")
            
            # Wait a moment then open browser
            time.sleep(1)
            webbrowser.open(self.base_url)
            
        except Exception as e:
            print(f"❌ Error starting server: {e}")
            self.server_process = None
            self.is_running = False
            self.update_icon_menu()
    
    def stop_server(self, icon=None, item=None):
        """Stop the WL-Drop server"""
        if self.server_process:
            try:
                self.server_process.terminate()
                try:
                    self.server_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.server_process.kill()
                    self.server_process.wait()
                
                self.server_process = None
                self.is_running = False
                self.update_icon_menu()
                print("🛑 Server stopped")
                
            except Exception as e:
                print(f"❌ Error stopping server: {e}")
    
    def open_browser(self, icon=None, item=None):
        """Open WL-Drop in browser"""
        webbrowser.open(self.base_url)
    
    def update_icon_menu(self):
        """Update the system tray icon menu"""
        if self.icon:
            self.icon.menu = self.create_menu()
    
    def create_menu(self):
        """Create the system tray menu"""
        if self.is_running:
            status_text = "🟢 Server Running"
            return pystray.Menu(
                pystray.MenuItem(status_text, None, enabled=False),
                pystray.Menu.SEPARATOR,
                pystray.MenuItem("Open in Browser", self.open_browser),
                pystray.MenuItem("Stop Server", self.stop_server),
                pystray.Menu.SEPARATOR,
                pystray.MenuItem("Exit", self.quit_app)
            )
        else:
            status_text = "🔴 Server Stopped"
            return pystray.Menu(
                pystray.MenuItem(status_text, None, enabled=False),
                pystray.Menu.SEPARATOR,
                pystray.MenuItem("Start Server", self.start_server),
                pystray.Menu.SEPARATOR,
                pystray.MenuItem("Exit", self.quit_app)
            )
    
    def quit_app(self, icon=None, item=None):
        """Quit the application"""
        self.stop_server()
        if self.icon:
            self.icon.stop()
    
    def run(self):
        """Run the system tray application"""
        # Create icon
        image = self.load_icon_image()
        self.icon = pystray.Icon(
            "WL-Drop",
            image,
            "WL-Drop - Local File Sharing",
            menu=self.create_menu()
        )
        
        # Start server automatically
        self.start_server()
        
        # Setup periodic server check
        import threading
        def check_server_status():
            while True:
                time.sleep(5)  # Check every 5 seconds
                if self.server_process and self.server_process.poll() is not None:
                    # Server process died
                    if self.is_running:
                        print("⚠️ Server process died unexpectedly")
                        self.server_process = None
                        self.is_running = False
                        self.update_icon_menu()
                elif not self.server_process and self.is_running:
                    # Inconsistent state
                    self.is_running = False
                    self.update_icon_menu()
        
        monitor_thread = threading.Thread(target=check_server_status, daemon=True)
        monitor_thread.start()
        
        # Run the icon (this blocks until quit)
        self.icon.run()


def main():
    """Main entry point"""
    app = WLDropTray()
    app.run()


if __name__ == "__main__":
    main()
