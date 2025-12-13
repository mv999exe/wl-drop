"""
WL-Drop System Tray Application
Simple and reliable background app with server control
"""

import sys
import os
import subprocess
import time
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
    
    def start_server(self, icon=None, item=None):
        """Start the WL-Drop server"""
        if self.server_process and self.server_process.poll() is None:
            print("⚠️ Server already running")
            return
        
        try:
            script_dir = Path(__file__).parent
            python_exe = script_dir / "python" / "python.exe"
            run_script = script_dir / "run.py"
            
            # Check if we're in development or production
            if not python_exe.exists():
                python_exe = sys.executable
            
            # Create uploads directory
            uploads_dir = script_dir / "uploads"
            uploads_dir.mkdir(exist_ok=True)
            
            # Start server process (hidden on Windows)
            if sys.platform == "win32":
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startupinfo.wShowWindow = 0  # SW_HIDE
                
                self.server_process = subprocess.Popen(
                    [str(python_exe), str(run_script)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    startupinfo=startupinfo,
                    creationflags=subprocess.CREATE_NO_WINDOW,
                    cwd=str(script_dir)
                )
            else:
                self.server_process = subprocess.Popen(
                    [str(python_exe), str(run_script)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=str(script_dir)
                )
            
            self.is_running = True
            self.update_icon_menu()
            print("✅ Server started")
            
            # Wait a moment then open browser
            time.sleep(2)
            webbrowser.open(self.base_url)
            
        except Exception as e:
            print(f"❌ Error starting server: {e}")
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
        
        # Run the icon (this blocks until quit)
        self.icon.run()


def main():
    """Main entry point"""
    app = WLDropTray()
    app.run()


if __name__ == "__main__":
    main()
