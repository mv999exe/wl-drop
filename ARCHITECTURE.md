# 📊 System Architecture

## Overview

WL-Drop is a full-stack local file sharing application that uses modern web technologies to enable fast, secure peer-to-peer file transfers on local networks.

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server for production
- **WebSockets** - Real-time bidirectional communication
- **Pydantic** - Data validation and settings management
- **aiofiles** - Async file operations

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icon set
- **Tailwind CSS** - Utility-first CSS (via inline styles)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Frontend (SPA)                     │  │
│  │  • SenderView  • ReceiverView  • ProfileModal        │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│              ┌───────────┴──────────┐                       │
│              │                      │                        │
│         HTTP/REST API          WebSocket                     │
│              │                      │                        │
└──────────────┼──────────────────────┼───────────────────────┘
               │                      │
               ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Server                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   API Endpoints                       │  │
│  │  • /api/devices      • /api/files                    │  │
│  │  • /api/transfers    • /ws/{client_id}               │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              Core Components                          │  │
│  │  • WebSocket Manager  • Device Manager               │  │
│  │  • File Upload/Download Handler                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                 Background Services                   │  │
│  │  • Cleanup Service (auto-delete old files)           │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  File System  │
                   │  (./uploads)  │
                   └───────────────┘
```

## Data Flow

### Device Discovery Flow
1. Client opens app → WebSocket connection established
2. Client sends `register` message with device info
3. Server broadcasts updated device list to all clients
4. Clients in "Receive" mode appear in sender's device list

### File Transfer Flow
1. **Sender** selects files and receiver
2. Files uploaded to server via HTTP POST (chunked)
3. Server creates transfer record with unique ID
4. Server sends WebSocket notification to receiver
5. **Receiver** sees incoming transfer request
6. Receiver accepts → files downloaded as ZIP
7. Server cleans up files after configured time

## WebSocket Protocol

### Message Types

```typescript
// Client → Server
{
  type: "register",
  name: "Device Name",
  deviceType: "DESKTOP",
  mode: "HOME",
  avatarId: 0
}

{
  type: "update_mode",
  mode: "RECEIVE"
}

// Server → Client
{
  type: "device_list",
  devices: [...]
}

{
  type: "transfer_request",
  transferId: "uuid",
  from: "sender_id",
  fromName: "Sender Name",
  files: [...]
}
```

## API Endpoints

### Devices
- `GET /api/devices` - List all connected devices
- `GET /api/devices/{id}` - Get specific device
- `GET /api/devices/receivers` - Get devices in receive mode

### Files
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files/download/{transfer_id}` - Download as ZIP
- `GET /api/files/download/{transfer_id}/{file}` - Download single file

### Transfers
- `POST /api/transfers/initiate` - Start transfer
- `GET /api/transfers/{id}` - Get transfer info
- `POST /api/transfers/{id}/accept` - Accept transfer
- `POST /api/transfers/{id}/reject` - Reject transfer
- `DELETE /api/transfers/{id}` - Delete transfer

## Security Considerations

### Current Implementation
- ✅ Local network only (no internet exposure)
- ✅ Filename sanitization (prevent path traversal)
- ✅ Auto cleanup of old files
- ✅ No authentication (trust local network)

### Future Enhancements
- 🔄 Optional password protection
- 🔄 End-to-end encryption
- 🔄 Rate limiting
- 🔄 File size limits per user
- 🔄 Virus scanning integration

## Performance

### Optimizations
- Async I/O for file operations
- Chunked file uploads
- WebSocket for real-time updates (no polling)
- Efficient ZIP creation with compression
- Background cleanup service

### Scalability
- Handles multiple concurrent transfers
- Memory-efficient streaming for large files
- Configurable chunk sizes
- Auto cleanup prevents disk overflow

## Deployment Options

### Local Development
```bash
uvicorn backend.main:app --reload
```

### Production (Single Server)
```bash
python run.py
```

### Docker (Future)
```dockerfile
# Containerized deployment for easy distribution
```

### Desktop App (Future)
- Package with PyInstaller
- Embed Python + dependencies
- Auto-start server on launch
- System tray icon

## File Organization

```
wl-drop/
├── backend/              # Backend source code
│   ├── api/             # REST API endpoints
│   ├── core/            # Core functionality
│   │   ├── config.py    # Settings
│   │   ├── utils.py     # Helper functions
│   │   └── websocket_manager.py
│   ├── services/        # Background services
│   └── main.py          # FastAPI app
│
├── components/          # React components
├── utils/              # Frontend utilities
│   ├── api.ts          # API client
│   ├── helpers.ts      # Helpers
│   └── websocket.ts    # WebSocket client
│
├── uploads/            # Temporary file storage
├── dist/               # Built frontend
│
├── run.py              # Server entry point
├── requirements.txt    # Python deps
├── package.json        # Node.js deps
└── vite.config.ts      # Vite configuration
```

## Testing Strategy

### Backend Tests (Future)
- Unit tests for API endpoints
- WebSocket message handling tests
- File upload/download tests
- Cleanup service tests

### Frontend Tests (Future)
- Component tests with React Testing Library
- E2E tests with Playwright
- WebSocket integration tests

## Monitoring & Logging

### Current Logging
- Server startup info
- Connection/disconnection events
- File transfer events
- Error logging

### Future Enhancements
- Structured logging (JSON)
- Performance metrics
- Transfer statistics
- Health check endpoint improvements

---

**Built with ❤️ for fast, secure local file sharing**
