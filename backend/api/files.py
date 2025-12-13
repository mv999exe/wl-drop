"""
Files API endpoints
Handle file upload, download, and transfer management
"""

import os
import uuid
import shutil
import aiofiles
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from backend.core.config import settings
from backend.core.websocket_manager import ws_manager

router = APIRouter()


class FileMetadata(BaseModel):
    """File metadata model"""
    id: str
    name: str
    size: int
    type: str
    path: Optional[str] = None
    uploadedBy: str
    uploadedAt: str


class TransferRequest(BaseModel):
    """File transfer request model"""
    senderId: str
    receiverId: str
    files: List[dict]


# In-memory storage for transfer metadata
transfers_db = {}
files_db = {}


@router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    sender_id: str = Form(...),
    transfer_id: str = Form(...),
    relative_path: Optional[str] = Form(None)
):
    """
    Upload a file
    Supports chunked uploads and folder structures
    """
    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Determine file path (support folder structures)
        if relative_path:
            # Create folder structure
            file_path = Path(settings.UPLOAD_DIR) / transfer_id / relative_path
            file_path.parent.mkdir(parents=True, exist_ok=True)
        else:
            # Single file
            transfer_dir = Path(settings.UPLOAD_DIR) / transfer_id
            transfer_dir.mkdir(parents=True, exist_ok=True)
            file_path = transfer_dir / file.filename
        
        # Save file with async I/O
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Store file metadata
        file_size = os.path.getsize(file_path)
        file_metadata = {
            "id": file_id,
            "name": file.filename,
            "size": file_size,
            "type": file.content_type or "application/octet-stream",
            "path": relative_path or file.filename,
            "uploadedBy": sender_id,
            "transferId": transfer_id,
            "filePath": str(file_path)
        }
        
        files_db[file_id] = file_metadata
        
        # Update transfer metadata
        if transfer_id not in transfers_db:
            transfers_db[transfer_id] = {
                "id": transfer_id,
                "senderId": sender_id,
                "files": [],
                "totalSize": 0,
                "uploadedSize": 0
            }
        
        transfers_db[transfer_id]["files"].append(file_metadata)
        transfers_db[transfer_id]["totalSize"] += file_size
        transfers_db[transfer_id]["uploadedSize"] += file_size
        
        return {
            "success": True,
            "fileId": file_id,
            "transferId": transfer_id,
            "message": f"File {file.filename} uploaded successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/files/upload-multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    sender_id: str = Form(...),
    transfer_id: str = Form(...)
):
    """
    Upload multiple files at once
    """
    results = []
    
    for file in files:
        try:
            file_id = str(uuid.uuid4())
            transfer_dir = Path(settings.UPLOAD_DIR) / transfer_id
            transfer_dir.mkdir(parents=True, exist_ok=True)
            file_path = transfer_dir / file.filename
            
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            file_size = os.path.getsize(file_path)
            file_metadata = {
                "id": file_id,
                "name": file.filename,
                "size": file_size,
                "type": file.content_type or "application/octet-stream",
                "uploadedBy": sender_id,
                "transferId": transfer_id,
                "filePath": str(file_path)
            }
            
            files_db[file_id] = file_metadata
            results.append({"fileId": file_id, "name": file.filename, "success": True})
        
        except Exception as e:
            results.append({"name": file.filename, "success": False, "error": str(e)})
    
    return {
        "success": True,
        "transferId": transfer_id,
        "files": results
    }


@router.get("/files/download/{transfer_id}")
async def download_transfer(transfer_id: str):
    """
    Get list of files in a transfer for individual download
    """
    if transfer_id not in transfers_db:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    transfer = transfers_db[transfer_id]
    
    return {
        "transferId": transfer_id,
        "files": transfer.get("files", []),
        "totalSize": transfer.get("totalSize", 0),
        "status": transfer.get("status", "pending")
    }


@router.get("/files/download/{transfer_id}/{file_path:path}")
async def download_single_file(transfer_id: str, file_path: str):
    """
    Download a single file from a transfer (supports nested paths)
    """
    transfer_dir = Path(settings.UPLOAD_DIR) / transfer_id
    full_file_path = transfer_dir / file_path
    
    # Security: Ensure the file is within the transfer directory
    try:
        full_file_path = full_file_path.resolve()
        transfer_dir = transfer_dir.resolve()
        if not str(full_file_path).startswith(str(transfer_dir)):
            raise HTTPException(status_code=403, detail="Access denied")
    except:
        raise HTTPException(status_code=403, detail="Invalid file path")
    
    if not full_file_path.exists() or not full_file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get original filename
    filename = full_file_path.name
    
    return FileResponse(
        full_file_path,
        media_type="application/octet-stream",
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Accept-Ranges": "bytes"
        }
    )


@router.get("/transfers/{transfer_id}")
async def get_transfer_info(transfer_id: str):
    """
    Get transfer information
    """
    if transfer_id not in transfers_db:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    return transfers_db[transfer_id]


@router.post("/transfers/initiate")
async def initiate_transfer(
    sender_id: str = Form(...),
    receiver_id: str = Form(...),
    transfer_id: str = Form(...)
):
    """
    Initiate a file transfer between devices
    """
    # Get files from upload directory
    transfer_dir = Path(settings.UPLOAD_DIR) / transfer_id
    
    if not transfer_dir.exists():
        raise HTTPException(status_code=404, detail="Transfer files not found")
    
    # Collect file information
    files_info = []
    total_size = 0
    
    for file_path in transfer_dir.rglob('*'):
        if file_path.is_file():
            relative_path = file_path.relative_to(transfer_dir)
            file_size = file_path.stat().st_size
            files_info.append({
                "name": file_path.name,
                "path": str(relative_path),
                "size": file_size
            })
            total_size += file_size
    
    # Create transfer record
    transfers_db[transfer_id] = {
        "id": transfer_id,
        "senderId": sender_id,
        "receiverId": receiver_id,
        "files": files_info,
        "status": "pending",
        "totalSize": total_size,
        "uploadedSize": 0
    }
    
    # Notify receiver via WebSocket
    await ws_manager.send_personal_message(receiver_id, {
        "type": "transfer_request",
        "transferId": transfer_id,
        "from": sender_id,
        "files": files_info
    })
    
    return {
        "success": True,
        "transferId": transfer_id,
        "message": "Transfer initiated"
    }


@router.post("/transfers/{transfer_id}/accept")
async def accept_transfer(transfer_id: str, receiver_id: str = Form(...)):
    """
    Accept a file transfer
    """
    if transfer_id not in transfers_db:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    transfer = transfers_db[transfer_id]
    transfer["status"] = "accepted"
    
    # Notify sender
    await ws_manager.send_personal_message(transfer["senderId"], {
        "type": "transfer_accepted",
        "transferId": transfer_id,
        "receiverId": receiver_id
    })
    
    return {"success": True, "message": "Transfer accepted"}


@router.post("/transfers/{transfer_id}/reject")
async def reject_transfer(transfer_id: str):
    """
    Reject a file transfer
    """
    if transfer_id not in transfers_db:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    transfer = transfers_db[transfer_id]
    transfer["status"] = "rejected"
    
    # Notify sender
    await ws_manager.send_personal_message(transfer["senderId"], {
        "type": "transfer_rejected",
        "transferId": transfer_id
    })
    
    return {"success": True, "message": "Transfer rejected"}


@router.delete("/transfers/{transfer_id}")
async def delete_transfer(transfer_id: str):
    """
    Delete a transfer and its files
    """
    transfer_dir = Path(settings.UPLOAD_DIR) / transfer_id
    
    if transfer_dir.exists():
        shutil.rmtree(transfer_dir)
    
    if transfer_id in transfers_db:
        del transfers_db[transfer_id]
    
    return {"success": True, "message": "Transfer deleted"}


@router.get("/files/list")
async def list_files():
    """
    List all uploaded files
    """
    return {"files": list(files_db.values())}
