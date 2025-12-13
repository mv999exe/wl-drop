"""
Cleanup utilities for file transfers
Files are now deleted immediately after successful download
This module provides manual cleanup functions if needed
"""

import shutil
from pathlib import Path
from backend.core.config import settings


def cleanup_transfer(transfer_id: str) -> bool:
    """
    Manually cleanup a specific transfer directory
    
    Args:
        transfer_id: The transfer ID to cleanup
        
    Returns:
        True if cleanup was successful, False otherwise
    """
    transfer_dir = Path(settings.UPLOAD_DIR) / transfer_id
    
    if transfer_dir.exists():
        try:
            shutil.rmtree(transfer_dir)
            print(f"🗑️  Deleted transfer directory: {transfer_id}")
            return True
        except Exception as e:
            print(f"Error deleting {transfer_id}: {e}")
            return False
    
    return False


def cleanup_all_transfers() -> int:
    """
    Manually cleanup all transfer directories
    
    Returns:
        Number of directories deleted
    """
    upload_dir = Path(settings.UPLOAD_DIR)
    
    if not upload_dir.exists():
        return 0
    
    deleted_count = 0
    
    for item in upload_dir.iterdir():
        if item.is_dir() and item.name.startswith("transfer_"):
            try:
                shutil.rmtree(item)
                deleted_count += 1
                print(f"🗑️  Deleted transfer: {item.name}")
            except Exception as e:
                print(f"Error deleting {item.name}: {e}")
    
    if deleted_count > 0:
        print(f"✅ Manual cleanup completed: {deleted_count} transfers removed")
    
    return deleted_count

