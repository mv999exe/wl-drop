"""
Cleanup service for old uploaded files
"""

import os
import time
import asyncio
import shutil
from pathlib import Path
from backend.core.config import settings


class CleanupService:
    """
    Background service to clean up old uploaded files
    """
    
    def __init__(self):
        self.running = False
    
    async def start(self):
        """Start the cleanup service"""
        self.running = True
        print(f"🧹 Cleanup service started (files older than {settings.AUTO_CLEANUP_HOURS}h will be deleted)")
        
        while self.running:
            try:
                await self.cleanup_old_files()
                # Run cleanup every hour
                await asyncio.sleep(3600)
            except Exception as e:
                print(f"Cleanup error: {e}")
                await asyncio.sleep(3600)
    
    async def cleanup_old_files(self):
        """Clean up files older than configured hours"""
        upload_dir = Path(settings.UPLOAD_DIR)
        
        if not upload_dir.exists():
            return
        
        current_time = time.time()
        max_age_seconds = settings.AUTO_CLEANUP_HOURS * 3600
        
        deleted_count = 0
        
        # Iterate through transfer directories
        for item in upload_dir.iterdir():
            if item.is_dir():
                # Check directory age
                dir_age = current_time - item.stat().st_mtime
                
                if dir_age > max_age_seconds:
                    try:
                        shutil.rmtree(item)
                        deleted_count += 1
                        print(f"🗑️  Deleted old transfer: {item.name}")
                    except Exception as e:
                        print(f"Error deleting {item.name}: {e}")
            
            # Also clean up zip files
            elif item.is_file() and item.suffix == '.zip':
                file_age = current_time - item.stat().st_mtime
                
                if file_age > 3600:  # Delete zip files older than 1 hour
                    try:
                        item.unlink()
                        deleted_count += 1
                        print(f"🗑️  Deleted old zip: {item.name}")
                    except Exception as e:
                        print(f"Error deleting {item.name}: {e}")
        
        if deleted_count > 0:
            print(f"✅ Cleanup completed: {deleted_count} items removed")
    
    def stop(self):
        """Stop the cleanup service"""
        self.running = False
        print("🛑 Cleanup service stopped")


# Global cleanup service instance
cleanup_service = CleanupService()
