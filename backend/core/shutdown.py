"""
Auto-shutdown manager for WL-Drop
Monitors active browser tabs and shuts down server when all tabs are closed
"""

import asyncio
import time
from datetime import datetime


class ShutdownManager:
    def __init__(self):
        self.last_heartbeat = time.time()
        self.shutdown_delay = 10  # seconds after last heartbeat
        self.is_monitoring = False
        
    def heartbeat(self):
        """Record a heartbeat from an active browser tab"""
        self.last_heartbeat = time.time()
        
    async def monitor(self):
        """Monitor heartbeats and shutdown if no activity"""
        if self.is_monitoring:
            return
            
        self.is_monitoring = True
        
        # Give initial grace period for first connection
        await asyncio.sleep(30)
        
        while True:
            await asyncio.sleep(2)
            
            time_since_last = time.time() - self.last_heartbeat
            
            if time_since_last > self.shutdown_delay:
                print(f"\n🛑 No active tabs detected for {self.shutdown_delay}s")
                print("📴 Shutting down server...")
                
                # Trigger graceful shutdown
                import signal
                import os
                os.kill(os.getpid(), signal.SIGTERM)
                break


# Global shutdown manager instance
shutdown_manager = ShutdownManager()
