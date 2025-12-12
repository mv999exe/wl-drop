# WL-Drop Backend

Backend server for WL-Drop file sharing application.

## Structure

```
backend/
├── api/                    # API endpoints
│   ├── devices.py         # Device management endpoints
│   └── files.py           # File upload/download endpoints
├── core/                   # Core functionality
│   ├── config.py          # Configuration management
│   ├── utils.py           # Utility functions
│   └── websocket_manager.py  # WebSocket connection manager
├── services/               # Background services
│   └── cleanup.py         # Automatic file cleanup
└── main.py                # FastAPI application
```

## Components

### API Layer (`api/`)
- **devices.py**: Device discovery and management
- **files.py**: File upload, download, and transfer management

### Core Layer (`core/`)
- **config.py**: Centralized configuration using Pydantic
- **utils.py**: Helper functions (IP detection, file operations)
- **websocket_manager.py**: WebSocket connection and message handling

### Services (`services/`)
- **cleanup.py**: Background service for cleaning old files

## Running

From project root:
```bash
python run.py
```

Or directly:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Configuration

Create `.env` file in project root or `backend/` directory:

```env
HOST=0.0.0.0
PORT=8000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10737418240
CHUNK_SIZE=1048576
AUTO_CLEANUP_HOURS=24
```

## Dependencies

See `requirements.txt` in project root.

Main dependencies:
- FastAPI 0.109+
- Uvicorn (ASGI server)
- WebSockets 12.0+
- Pydantic 2.5+
- aiofiles 23.2+
