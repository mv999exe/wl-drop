# 🚀 Quick Start Guide

## For End Users 👥

### Download Pre-built Version (Recommended)

**No installation or technical knowledge required!**

1. **Download** from [GitHub Releases](https://github.com/mv999exe/wl-drop/releases):
   - 🪟 **Windows**: `wl-drop-windows-x64.zip`
   - 🐧 **Linux**: `wl-drop-linux-x64.tar.gz`

2. **Extract** the downloaded file to any folder

3. **Run**:
   - 🪟 **Windows**: Double-click `WL-Drop.bat`
   - 🐧 **Linux**: Open terminal, run `./run.sh`

4. **Use**: Browser opens automatically, or visit `http://localhost:8000`

That's it! Share the Network URL shown with other devices on your WiFi.

---

## For Developers 👨‍💻

### Method 1: Using Install Scripts (Easiest)

#### Linux/macOS
```bash
./install.sh  # Installs everything
./start.sh    # Starts the server
```

#### Windows
```cmd
install.bat   # Installs everything
start.bat     # Starts the server
```

### Method 2: Manual Installation

#### 1. Install Python Dependencies

```bash
# Create virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Build Frontend (optional - for development)

```bash
# Install Node.js dependencies
npm install

# Build the frontend
npm run build
```

### Running the Server

#### Simple Method

```bash
python run.py
```

The server will start on `http://0.0.0.0:8000` and display your network IP.

#### Development Mode (with auto-reload)

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Building for Distribution

Want to create standalone executables?

```bash
# Linux
./build.sh

# Windows
build.bat
```

This creates ready-to-distribute packages in the `release/` folder.

See [BUILD.md](BUILD.md) for detailed build instructions.

---

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8000/api/health

# List devices
curl http://localhost:8000/api/devices

# API Documentation (Swagger UI)
# Open in browser: http://localhost:8000/docs
```

### Frontend Development

```bash
# Run Vite dev server
npm run dev
```

This will start the frontend on `http://localhost:5173`

## Usage

### From the Same Computer

1. Open browser: `http://localhost:8000`
2. Choose Send or Receive mode

### From Another Device on Network

1. Find your local IP (shown when server starts)
2. On another device, open: `http://YOUR_LOCAL_IP:8000`
3. Start sending/receiving files!

## Configuration

Create a `.env` file:

```env
HOST=0.0.0.0
PORT=8000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10737418240  # 10GB
AUTO_CLEANUP_HOURS=24
```

## Troubleshooting

### Port Already in Use

```bash
# Linux/Mac - find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Firewall Issues

Make sure port 8000 is open:

```bash
# Linux (UFW)
sudo ufw allow 8000

# Check if port is accessible
nc -zv localhost 8000
```

### Frontend Not Loading

If you see "Frontend not built" message:

```bash
npm run build
```

## Project Structure

```
wl-drop/
├── backend/           # Python FastAPI backend
├── components/        # React components
├── utils/             # Frontend utilities
├── run.py            # Server entry point
├── App.tsx           # Main React app
└── requirements.txt  # Python dependencies
```

## Development Workflow

1. **Backend Changes**: Server auto-reloads with `--reload` flag
2. **Frontend Changes**: Run `npm run dev` for hot-reload
3. **Production Build**: Run `npm run build` before deployment

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/devices` - List connected devices
- `POST /api/files/upload` - Upload file
- `GET /api/files/download/{transfer_id}` - Download transfer
- `POST /api/transfers/initiate` - Start transfer
- `WS /ws/{client_id}` - WebSocket connection

## Need Help?

- Check [README.md](README.md) for detailed documentation
- API docs available at `http://localhost:8000/docs`
- Open an issue on GitHub

---

**Happy Coding! 🎉**
