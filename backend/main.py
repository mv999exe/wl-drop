"""
WL-Drop Backend Server
A local file sharing application server using FastAPI
"""

import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings
from backend.api import files, devices
from backend.core.websocket_manager import ws_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print(f"🚀 WL-Drop Server starting on {settings.HOST}:{settings.PORT}")
    print(f"📁 Upload directory: {settings.UPLOAD_DIR}")
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    yield
    
    # Shutdown
    print("👋 WL-Drop Server shutting down")


app = FastAPI(
    title="WL-Drop API",
    description="Local file sharing backend",
    version="1.1.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local network
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(devices.router, prefix="/api", tags=["devices"])
app.include_router(files.router, prefix="/api", tags=["files"])


# WebSocket endpoint for real-time communication
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket connection for real-time device discovery and file transfer notifications"""
    await ws_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            await ws_manager.handle_message(client_id, data)
    except WebSocketDisconnect:
        ws_manager.disconnect(client_id)


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Server health check"""
    from backend.core.utils import get_local_ip
    
    local_ip = get_local_ip()
    
    return {
        "status": "healthy",
        "version": "1.1.0",
        "server": f"{local_ip}:{settings.PORT}"
    }


# Serve React frontend
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")

if os.path.exists(DIST_DIR):
    # Mount static assets
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React frontend for all routes except /api and /ws"""
        # Don't interfere with API routes
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            return {"error": "Not found"}, 404
            
        # If requesting a specific file in dist, serve it
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise serve index.html (SPA routing)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "message": "WL-Drop API Server",
            "note": "Frontend not built. Run 'npm run build' in the root directory."
        }
