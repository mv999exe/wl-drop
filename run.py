"""
Main entry point for WL-Drop server
Run this script to start the server
"""

import sys
import os
import argparse
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn
from backend.core.config import settings
from backend.core.utils import get_local_ip

# ANSI color codes for terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_banner():
    """Print WL-Drop banner"""
    print(f"""
{Colors.OKCYAN}{Colors.BOLD}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║      ⚡ WL-Drop - Local File Sharing Server              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
{Colors.ENDC}""")

def print_help():
    """Print help information"""
    print_banner()
    print(f"""
{Colors.BOLD}USAGE:{Colors.ENDC}
    wl-drop [OPTIONS]

{Colors.BOLD}OPTIONS:{Colors.ENDC}
    {Colors.OKGREEN}-h, --help{Colors.ENDC}          Show this help message and exit
    {Colors.OKGREEN}-v, --version{Colors.ENDC}       Show version information
    {Colors.OKGREEN}-p, --port PORT{Colors.ENDC}     Specify port (default: 8000)
    {Colors.OKGREEN}--host HOST{Colors.ENDC}         Specify host (default: 0.0.0.0)

{Colors.BOLD}EXAMPLES:{Colors.ENDC}
    {Colors.OKCYAN}wl-drop{Colors.ENDC}                    Start server on default port 8000
    {Colors.OKCYAN}wl-drop -p 3000{Colors.ENDC}            Start server on port 3000
    {Colors.OKCYAN}wl-drop --host 192.168.1.10{Colors.ENDC} Start server on specific IP

{Colors.BOLD}DESCRIPTION:{Colors.ENDC}
    WL-Drop is a simple and secure local file sharing server.
    Share files instantly with any device on your local network.
    
    {Colors.WARNING}No internet required - works entirely on your local WiFi!{Colors.ENDC}

{Colors.BOLD}MORE INFO:{Colors.ENDC}
    Documentation: https://github.com/mv999exe/wl-drop
    Website: https://mv999exe.github.io/wldrop-website/
""")

def print_version():
    """Print version information"""
    try:
        import json
        with open(Path(__file__).parent / 'package.json', 'r') as f:
            version = json.load(f).get('version', 'unknown')
    except:
        version = '1.3.0'
    
    print(f"""
{Colors.BOLD}WL-Drop{Colors.ENDC} version {Colors.OKGREEN}{version}{Colors.ENDC}

Local File Sharing Made Easy
Copyright (c) 2025 WL-Drop Contributors
License: MIT
""")

def main():
    """Run the WL-Drop server"""
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='WL-Drop - Local File Sharing Server',
        add_help=False
    )
    parser.add_argument('-h', '--help', action='store_true', help='Show help message')
    parser.add_argument('-v', '--version', action='store_true', help='Show version')
    parser.add_argument('-p', '--port', type=int, default=settings.PORT, help='Port number')
    parser.add_argument('--host', type=str, default=settings.HOST, help='Host address')
    
    args = parser.parse_args()
    
    # Handle help
    if args.help:
        print_help()
        sys.exit(0)
    
    # Handle version
    if args.version:
        print_version()
        sys.exit(0)
    
    # Get local IP for display
    local_ip = get_local_ip()
    
    # Print startup banner
    print_banner()
    print(f"""
{Colors.BOLD}🌐 Server Information:{Colors.ENDC}
    {Colors.OKGREEN}●{Colors.ENDC} Local:   {Colors.OKCYAN}http://localhost:{args.port}{Colors.ENDC}
    {Colors.OKGREEN}●{Colors.ENDC} Network: {Colors.OKCYAN}http://{local_ip}:{args.port}{Colors.ENDC}

{Colors.BOLD}📱 Share with other devices:{Colors.ENDC}
    Connect to: {Colors.WARNING}http://{local_ip}:{args.port}{Colors.ENDC}
    
{Colors.BOLD}💡 Tips:{Colors.ENDC}
    • Make sure devices are on the same WiFi network
    • Press {Colors.WARNING}Ctrl+C{Colors.ENDC} to stop the server
    • Server auto-shuts down when browser tab closes

{Colors.OKCYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.ENDC}
""")
    
    # Run the server
    try:
        uvicorn.run(
            "backend.main:app",
            host=args.host,
            port=args.port,
            reload=False,
            log_level="info"
        )
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Server stopped by user{Colors.ENDC}")
        print(f"{Colors.OKGREEN}Thank you for using WL-Drop!{Colors.ENDC}\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
