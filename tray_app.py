"""
WL-Drop System Tray Application
Professional background application with auto-shutdown monitoring
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
    from PIL import Image, ImageDraw
    import psutil
    import requests
except ImportError:
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "pystray", "Pillow", "psutil", "requests"])
    import pystray
    from PIL import Image, ImageDraw
    import psutil
    import requests


class WLDropTray:
    def __init__(self):
        self.server_process = None
        self.icon = None
        self.is_running = False
        self.monitoring = False
        self.base_url = "http://localhost:8000"
        
    def create_icon_image(self):
        """Create a simple icon image"""
        # Create 64x64 icon with WL-Drop logo colors
        width = 64
        height = 64
        image = Image.new('RGB', (width, height), '#4F46E5')  # Indigo background
        draw = ImageDraw.Draw(image)
        
        # Draw a simple "WL" text-like shape
        # Draw W
        draw.polygon([
            (10, 15), (15, 15), (20, 40), (25, 15), (30, 15),
            (27, 50), (23, 50), (20, 30), (17, 50), (13, 50)
        ], fill='white')
        
        # Draw L
        draw.rectangle([35, 15, 40, 50], fill='white')
        draw.rectangle([35, 45, 50, 50], fill='white')
        
        return image
    
    def start_server(self):
        """Start the WL-Drop server"""
        if self.server_process and self.server_process.poll() is None:
            return  # Already running
        
        try:
            # Set up environment
            script_dir = Path(__file__).parent
            python_exe = script_dir / "python" / "python.exe"
            run_script = script_dir / "run.py"
            
            # Check if we're in development (venv) or production (embedded)
            if not python_exe.exists():
                python_exe = sys.executable
            
            # Create uploads directory
            uploads_dir = script_dir / "uploads"
            uploads_dir.mkdir(exist_ok=True)
            
            # Start server process
            if sys.platform == "win32":
                # On Windows, use CREATE_NO_WINDOW flag
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
            
            # Wait for server to start
            for _ in range(30):  # Wait up to 3 seconds
                try:
                    response = requests.get(self.base_url, timeout=1)
                    if response.status_code == 200:
                        break
                except:
                    pass
                time.sleep(0.1)
            
            # Open browser
            webbrowser.open(self.base_url)
            
            # Start monitoring
            if not self.monitoring:
                self.monitoring = True
                monitor_thread = threading.Thread(target=self.monitor_browser, daemon=True)
                monitor_thread.start()
                
        except Exception as e:
            print(f"Error starting server: {e}")
            self.is_running = False
            self.update_icon_menu()
    
    def stop_server(self):
        """Stop the WL-Drop server"""
        if self.server_process:
            try:
                # Terminate the process
                self.server_process.terminate()
                
                # Wait for it to end (with timeout)
                try:
                    self.server_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.server_process.kill()
                    self.server_process.wait()
                
                self.server_process = None
                self.is_running = False
                self.update_icon_menu()
                
            except Exception as e:
                print(f"Error stopping server: {e}")
    
    def monitor_browser(self):
        """Monitor browser tabs and auto-shutdown when all tabs are closed"""
        if sys.platform != "win32":
            return
        
        last_check_had_tabs = False
        grace_period = 10  # Wait 10 seconds after last tab closes
        tabs_closed_time = None
        
        while self.monitoring and self.is_running:
            time.sleep(2)
            
            try:
                has_active_tabs = self.check_active_tabs()
                
                if has_active_tabs:
                    last_check_had_tabs = True
                    tabs_closed_time = None
                elif last_check_had_tabs:
                    # Tabs were open, now closed
                    if tabs_closed_time is None:
                        tabs_closed_time = time.time()
                    elif time.time() - tabs_closed_time > grace_period:
                        # Grace period elapsed, shutdown
                        print("No active tabs detected. Auto-stopping server...")
                        self.stop_server()
                        break
                        
            except Exception as e:
                print(f"Monitor error: {e}")
    
    def check_active_tabs(self):
        """Check if there are any browser tabs accessing localhost:8000"""
        try:
            # Check if server is responding
            response = requests.get(f"{self.base_url}/api/health", timeout=1)
            
            # Check for active connections
            connections = psutil.net_connections(kind='inet')
            for conn in connections:
                if conn.status == 'ESTABLISHED' and conn.laddr.port == 8000:
                    return True
            
            return False
        except:
            return False
    
    def open_browser(self, icon=None, item=None):
        """Open WL-Drop in browser"""
        webbrowser.open(self.base_url)
    
    def toggle_server(self, icon=None, item=None):
        """Toggle server on/off"""
        if self.is_running:
            self.stop_server()
        else:
            self.start_server()
    
    def update_icon_menu(self):
        """Update the system tray icon menu"""
        if self.icon:
            self.icon.menu = self.create_menu()
    
    def create_menu(self):
        """Create the system tray menu"""
        status_text = "🟢 Server Running" if self.is_running else "🔴 Server Stopped"
        toggle_text = "Stop Server" if self.is_running else "Start Server"
        
        return pystray.Menu(
            pystray.MenuItem(status_text, None, enabled=False),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Open in Browser", self.open_browser),
            pystray.MenuItem(toggle_text, self.toggle_server),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Exit", self.quit_app)
        )
    
    def quit_app(self, icon=None, item=None):
        """Quit the application"""
        self.monitoring = False
        self.stop_server()
        if self.icon:
            self.icon.stop()
    
    def run(self):
        """Run the system tray application"""
        # Create icon
        image = self.create_icon_image()
        self.icon = pystray.Icon(
            "WL-Drop",
            image,
            "WL-Drop - Local File Sharing",
            menu=self.create_menu()
        )
        
        # Start server automatically
        start_thread = threading.Thread(target=self.start_server, daemon=True)
        start_thread.start()
        
        # Run the icon (this blocks until quit)
        self.icon.run()


def main():
    """Main entry point"""
    app = WLDropTray()
    app.run()


if __name__ == "__main__":
    main()
