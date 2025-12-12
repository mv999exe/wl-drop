"""
Devices API endpoints
Handle device discovery and management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.core.websocket_manager import ws_manager

router = APIRouter()


class DeviceInfo(BaseModel):
    """Device information model"""
    id: str
    name: str
    deviceType: str
    mode: str
    avatarId: int


class DeviceUpdateRequest(BaseModel):
    """Device update request"""
    name: Optional[str] = None
    mode: Optional[str] = None


@router.get("/devices", response_model=List[DeviceInfo])
async def get_devices():
    """Get list of all connected devices"""
    devices = [
        DeviceInfo(**device)
        for device in ws_manager.devices.values()
    ]
    return devices


@router.get("/devices/{device_id}", response_model=DeviceInfo)
async def get_device(device_id: str):
    """Get specific device information"""
    if device_id not in ws_manager.devices:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return DeviceInfo(**ws_manager.devices[device_id])


@router.get("/devices/receivers")
async def get_receivers():
    """Get list of devices in RECEIVE mode"""
    receivers = [
        DeviceInfo(**device)
        for device in ws_manager.devices.values()
        if device.get("mode") == "RECEIVE"
    ]
    return receivers
