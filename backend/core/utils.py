"""
Utility functions and helpers for the backend
"""

import os
import socket
from typing import Optional


def get_local_ip() -> str:
    """
    Get the local IP address of the machine
    This will be used to display the connection URL
    """
    try:
        # Create a socket to determine the local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"


def format_bytes(size_bytes: int) -> str:
    """
    Format bytes to human readable format
    """
    if size_bytes == 0:
        return "0 Bytes"
    
    k = 1024
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    
    import math
    i = int(math.floor(math.log(size_bytes) / math.log(k)))
    
    return f"{round(size_bytes / math.pow(k, i), 2)} {sizes[i]}"


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal attacks
    """
    # Remove path separators
    filename = filename.replace('/', '_').replace('\\', '_')
    
    # Remove other potentially dangerous characters
    dangerous_chars = ['..', '<', '>', ':', '"', '|', '?', '*']
    for char in dangerous_chars:
        filename = filename.replace(char, '_')
    
    return filename


def ensure_directory_exists(directory: str) -> None:
    """
    Ensure a directory exists, create if it doesn't
    """
    os.makedirs(directory, exist_ok=True)
