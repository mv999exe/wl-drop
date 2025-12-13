"""
WebSocket Connection Manager
Handles real-time communication between devices
"""

from typing import Dict, List, Any
from fastapi import WebSocket
import json
import asyncio


class WebSocketManager:
    """Manages WebSocket connections for real-time device communication"""
    
    def __init__(self):
        # Active connections: {client_id: websocket}
        self.active_connections: Dict[str, WebSocket] = {}
        
        # Device information: {client_id: device_info}
        self.devices: Dict[str, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"✅ Client {client_id} connected")
        
        # Send current devices list to new client
        await self.send_device_list(client_id)
    
    def disconnect(self, client_id: str):
        """Remove disconnected client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        
        if client_id in self.devices:
            del self.devices[client_id]
        
        print(f"❌ Client {client_id} disconnected")
        
        # Notify all clients about device list update
        asyncio.create_task(self.broadcast_device_list())
    
    async def send_personal_message(self, client_id: str, message: dict):
        """Send message to specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                print(f"Error sending to {client_id}: {e}")
                self.disconnect(client_id)
    
    async def broadcast(self, message: dict, exclude: List[str] = None):
        """Broadcast message to all connected clients"""
        exclude = exclude or []
        
        disconnected = []
        for client_id, websocket in self.active_connections.items():
            if client_id not in exclude:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting to {client_id}: {e}")
                    disconnected.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected:
            self.disconnect(client_id)
    
    async def handle_message(self, client_id: str, data: dict):
        """Handle incoming WebSocket messages"""
        msg_type = data.get("type")
        
        print(f"📨 Message from {client_id}: type={msg_type}, data={data}")
        
        if msg_type == "register":
            # Register device information
            self.devices[client_id] = {
                "id": client_id,
                "name": data.get("name", "Unknown"),
                "deviceType": data.get("deviceType", "DESKTOP"),
                "mode": data.get("mode", "HOME"),  # HOME, SEND, RECEIVE
                "avatarId": data.get("avatarId", 0)
            }
            
            print(f"✅ Registered device: {self.devices[client_id]}")
            
            # Broadcast updated device list
            await self.broadcast_device_list()
        
        elif msg_type == "update_mode":
            # Update device mode (HOME, SEND, RECEIVE)
            if client_id in self.devices:
                old_mode = self.devices[client_id]["mode"]
                new_mode = data.get("mode", "HOME")
                self.devices[client_id]["mode"] = new_mode
                
                print(f"🔄 Mode updated for {client_id}: {old_mode} → {new_mode}")
                print(f"📋 All devices: {self.devices}")
                
                await self.broadcast_device_list()
        
        elif msg_type == "send_request":
            # File transfer request to specific device
            target_id = data.get("targetId")
            if target_id in self.active_connections:
                await self.send_personal_message(target_id, {
                    "type": "transfer_request",
                    "from": client_id,
                    "fromName": self.devices.get(client_id, {}).get("name", "Unknown"),
                    "files": data.get("files", [])
                })
        
        elif msg_type == "accept_transfer":
            # Accept file transfer
            sender_id = data.get("senderId")
            if sender_id in self.active_connections:
                await self.send_personal_message(sender_id, {
                    "type": "transfer_accepted",
                    "from": client_id,
                    "transferId": data.get("transferId")
                })
        
        elif msg_type == "reject_transfer":
            # Reject file transfer
            sender_id = data.get("senderId")
            if sender_id in self.active_connections:
                await self.send_personal_message(sender_id, {
                    "type": "transfer_rejected",
                    "from": client_id
                })
        
        elif msg_type == "ping":
            # Keep-alive ping
            await self.send_personal_message(client_id, {"type": "pong"})
    
    async def send_device_list(self, client_id: str):
        """Send current device list to specific client"""
        devices_list = [
            device for device_id, device in self.devices.items()
            if device_id != client_id  # Don't send self
        ]
        
        await self.send_personal_message(client_id, {
            "type": "device_list",
            "devices": devices_list
        })
    
    async def broadcast_device_list(self):
        """Broadcast device list to all clients"""
        print(f"📢 Broadcasting device list to {len(self.active_connections)} clients")
        print(f"   Devices: {list(self.devices.values())}")
        
        for client_id in list(self.active_connections.keys()):
            await self.send_device_list(client_id)
    
    async def notify_transfer_progress(self, client_id: str, transfer_id: str, progress: float):
        """Notify client about transfer progress"""
        await self.send_personal_message(client_id, {
            "type": "transfer_progress",
            "transferId": transfer_id,
            "progress": progress
        })
    
    async def notify_transfer_complete(self, client_id: str, transfer_id: str):
        """Notify client about completed transfer"""
        await self.send_personal_message(client_id, {
            "type": "transfer_complete",
            "transferId": transfer_id
        })


# Global WebSocket manager instance
ws_manager = WebSocketManager()
