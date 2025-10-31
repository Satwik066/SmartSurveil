# 🎥 SmartSurveil - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [API Reference](#api-reference)
8. [Autonomous Detection](#autonomous-detection)
9. [Troubleshooting](#troubleshooting)
10. [Deployment](#deployment)

---

## Overview

SmartSurveil is an **autonomous intrusion detection system** that uses YOLOv8 AI to detect human presence in CCTV camera feeds. The system operates 24/7, continuously monitoring cameras and sending alerts when intruders are detected.

### Key Characteristics
- **Autonomous Operation**: Backend runs independently, detecting intruders without frontend connection
- **Real-time Detection**: YOLOv8 AI model processes video frames in real-time
- **Multi-camera Support**: Monitor multiple cameras simultaneously
- **Instant Alerts**: Email notifications with captured images
- **Web Dashboard**: Optional frontend for live monitoring and management

---

## Features

### Core Features
- ✅ **Autonomous Detection**: Backend operates 24/7 without requiring frontend
- ✅ **YOLOv8 AI Detection**: State-of-the-art human detection model
- ✅ **Multi-camera Support**: Monitor unlimited cameras concurrently
- ✅ **Region of Interest (ROI)**: Define specific areas to monitor per camera
- ✅ **Email Alerts**: Instant notifications with captured images
- ✅ **Intrusion Logging**: Complete history stored in database
- ✅ **User Authentication**: Secure JWT-based authentication
- ✅ **Live Streaming**: Real-time video feed to web dashboard (optional)
- ✅ **Camera Management**: Add, remove, pause/resume cameras via API or UI

### Detection Features
- Configurable confidence threshold
- Adjustable detection intervals (prevent alert spam)
- Person counting in ROI
- Alert image capture with annotations
- Automatic camera reconnection on failure

### Frontend Features
- Modern responsive UI built with React + Vite
- Real-time camera feed viewing
- Interactive ROI configuration
- Intrusion log viewer with images
- Camera status monitoring
- User authentication and session management

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    SmartSurveil System                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐         ┌──────────────┐             │
│  │   Frontend  │◄────────┤   Backend    │             │
│  │  (Optional) │ WebSocket│  (Core)      │             │
│  │   React +   │  HTTP   │  Flask +     │             │
│  │   Vite      │         │  SocketIO    │             │
│  └─────────────┘         └──────┬───────┘             │
│                                  │                      │
│                         ┌────────┴────────┐            │
│                         │                 │            │
│                    ┌────▼────┐      ┌────▼────┐       │
│                    │ YOLOv8  │      │ SQLite  │       │
│                    │Detection│      │Database │       │
│                    └────┬────┘      └─────────┘       │
│                         │                              │
│                    ┌────▼────┐                         │
│                    │ Camera  │                         │
│                    │ Streams │                         │
│                    └─────────┘                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture

**Core Modules:**
- `app.py` - Flask application, API routes, WebSocket handlers
- `detection.py` - YOLOv8 detection logic, camera stream handling
- `database.py` - SQLite database operations
- `config.py` - Configuration management

**Detection Flow:**
```
Backend Startup
    ↓
Load All Cameras from Database
    ↓
Start Detection Thread per Active Camera
    ↓
┌─────────────────────────────────┐
│  Per Camera Thread:             │
│  1. Connect to camera stream    │
│  2. Capture frame               │
│  3. Preprocess frame            │
│  4. Run YOLO detection on ROI   │
│  5. If person detected:         │
│     - Save alert image          │
│     - Log to database           │
│     - Send email alert          │
│     - Emit WebSocket (optional) │
│  6. Stream frame (if clients)   │
│  7. Sleep 33ms (30 FPS)         │
│  8. Repeat from step 2          │
└─────────────────────────────────┘
```

### Database Schema

**users**
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- created_at

**cameras**
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- name
- url
- is_active (BOOLEAN)
- detection_enabled (BOOLEAN)
- roi_x, roi_y, roi_width, roi_height
- created_at

**intrusion_logs**
- id (PRIMARY KEY)
- camera_id (FOREIGN KEY)
- image_path
- detection_count
- timestamp

---

## Installation

### System Requirements

**Minimum:**
- Python 3.8+
- 4GB RAM
- 2GB free disk space
- Webcam or IP camera

**Recommended:**
- Python 3.10+
- 8GB RAM
- GPU with CUDA support (optional)
- Stable network connection for IP cameras

### Backend Setup

1. **Clone or download the project**
```bash
cd SmartSurveil/backend
```

2. **Create virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
notepad .env  # Windows
nano .env     # Linux/Mac
```

5. **Run the backend**
```bash
python app.py
```

The backend will:
- Initialize the database
- Download YOLOv8 model (first run only)
- Start all active cameras
- Listen on `http://0.0.0.0:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd react-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open browser**
```
http://localhost:8080
```

### Production Build

**Frontend:**
```bash
npm run build
# Output in dist/ folder
```

**Backend:**
- Use production WSGI server (gunicorn, waitress)
- Set `debug=False` in `socketio.run()`
- Use environment variables for secrets

---

## Configuration

### Backend Configuration (`backend/config.py`)

**Security:**
```python
SECRET_KEY = 'your-secret-key-change-in-production'
```

**Database:**
```python
DATABASE_PATH = 'smartsurveil.db'  # SQLite database file
```

**Email Alerts:**
```python
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
EMAIL_ADDRESS = 'your-email@gmail.com'
EMAIL_PASSWORD = 'your-app-password'  # Use app-specific password
```

**Detection Settings:**
```python
MODEL_NAME = 'yolov8n.pt'           # YOLOv8 model (n/s/m/l/x)
CONFIDENCE_THRESHOLD = 0.5           # Detection confidence (0.0-1.0)
PERSON_CLASS_ID = 0                  # COCO person class
DETECTION_INTERVAL = 10              # Seconds between alerts
```

**Performance:**
```python
FRAME_WIDTH = 640                    # Processing resolution
FRAME_HEIGHT = 480
USE_GPU = False                      # Enable CUDA if available
STREAM_FPS = 30                      # Target frame rate
```

**Storage:**
```python
ALERT_IMAGES_PATH = 'alerts'         # Alert image directory
```

### Environment Variables (`.env`)

```env
# Security
SECRET_KEY=your-secret-key-here

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: Database
DATABASE_PATH=smartsurveil.db
```

### Gmail Setup for Alerts

1. Enable 2-Factor Authentication on your Google account
2. Generate App Password:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Use this password in `.env` file

---

## Usage

### Starting the System

**1. Start Backend (Required)**
```bash
cd backend
python app.py
```

Expected output:
```
============================================================
SmartSurveil Backend Starting...
============================================================
Server running on http://localhost:5000
API endpoints available at http://localhost:5000/api
Press CTRL+C to stop the server
============================================================

============================================================
Starting all active cameras for autonomous detection...
============================================================
✓ Started camera: Front Door (ID: 1)
✓ Started camera: Backyard (ID: 2)
○ Skipped inactive camera: Garage (ID: 3)
============================================================
Total cameras started: 2/3
Backend is now running autonomous intrusion detection!
============================================================
```

**2. Start Frontend (Optional)**
```bash
cd react-frontend
npm run dev
```

Open browser: `http://localhost:8080`

### User Registration

1. Open frontend
2. Click "Register"
3. Enter username, email, password
4. Click "Create Account"

### Adding Cameras

**Via Frontend:**
1. Login to dashboard
2. Click "Add Camera"
3. Enter camera name and URL
4. Click "Add"
5. Camera starts automatically

**Via API:**
```bash
curl -X POST http://localhost:5000/api/cameras \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Front Door",
    "url": "0"
  }'
```

### Camera URL Formats

**Webcam:**
```
0          # Default webcam
1          # Second webcam
```

**RTSP Stream:**
```
rtsp://username:password@192.168.1.100:554/stream
rtsp://192.168.1.100:554/stream1
```

**HTTP/MJPEG Stream:**
```
http://192.168.1.100:8080/video
http://192.168.1.100/mjpeg
```

**YouTube/HLS (experimental):**
```
https://www.youtube.com/watch?v=VIDEO_ID
```

### Configuring ROI (Region of Interest)

**Via Frontend:**
1. Click on camera card
2. Click "Set ROI"
3. Draw rectangle on video feed
4. Click "Save ROI"

**Via API:**
```bash
curl -X POST http://localhost:5000/api/cameras/1/roi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "x": 100,
    "y": 50,
    "width": 400,
    "height": 300
  }'
```

### Managing Cameras

**Toggle Active Status:**
```bash
POST /api/cameras/{camera_id}/toggle
Body: {"is_active": true}
```

**Toggle Detection:**
```bash
POST /api/cameras/{camera_id}/detection
Body: {"enabled": true}
```

**Delete Camera:**
```bash
DELETE /api/cameras/{camera_id}
```

### Viewing Intrusion Logs

**Via Frontend:**
- Dashboard shows recent intrusions
- Click on log entry to view full image
- Filter by camera or date

**Via API:**
```bash
GET /api/logs?limit=50
```

---

## API Reference

### Authentication

**Register User**
```http
POST /api/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "secure123"
}

Response: 201 Created
{
  "message": "User created successfully"
}
```

**Login**
```http
POST /api/login
Content-Type: application/json

{
  "username": "john",
  "password": "secure123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com"
  }
}
```

### Camera Management

**Get All Cameras**
```http
GET /api/cameras
Authorization: Bearer {token}

Response: 200 OK
{
  "cameras": [
    {
      "id": 1,
      "name": "Front Door",
      "url": "0",
      "is_active": true,
      "detection_enabled": true,
      "roi_x": 0,
      "roi_y": 0,
      "roi_width": 640,
      "roi_height": 480
    }
  ]
}
```

**Add Camera**
```http
POST /api/cameras
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Backyard",
  "url": "rtsp://192.168.1.100:554/stream"
}

Response: 201 Created
{
  "message": "Camera added successfully",
  "camera_id": 2
}
```

**Toggle Camera Status**
```http
POST /api/cameras/{camera_id}/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_active": false
}

Response: 200 OK
{
  "message": "Camera status updated"
}
```

**Toggle Detection**
```http
POST /api/cameras/{camera_id}/detection
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": false
}

Response: 200 OK
{
  "message": "Detection status updated"
}
```

**Set ROI**
```http
POST /api/cameras/{camera_id}/roi
Authorization: Bearer {token}
Content-Type: application/json

{
  "x": 100,
  "y": 50,
  "width": 400,
  "height": 300
}

Response: 200 OK
{
  "message": "ROI updated"
}
```

**Delete Camera**
```http
DELETE /api/cameras/{camera_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Camera deleted successfully"
}
```

### Intrusion Logs

**Get Logs**
```http
GET /api/logs?limit=50
Authorization: Bearer {token}

Response: 200 OK
{
  "logs": [
    {
      "id": 1,
      "camera_id": 1,
      "camera_name": "Front Door",
      "image_path": "alerts/camera_1_20231031_143022.jpg",
      "detection_count": 2,
      "timestamp": "2023-10-31T14:30:22"
    }
  ]
}
```

**Get Alert Image**
```http
GET /api/alerts/{filename}

Response: 200 OK
Content-Type: image/jpeg
(Binary image data)
```

### WebSocket Events

**Connect**
```javascript
const socket = io('http://localhost:5000');
```

**Receive Camera Frame**
```javascript
socket.on('camera_frame_{camera_id}', (data) => {
  // data.frame: base64 encoded image
  // data.timestamp: frame timestamp
});
```

**Receive Intrusion Alert**
```javascript
socket.on('intrusion_detected', (data) => {
  // data.camera_id
  // data.camera_name
  // data.person_count
  // data.timestamp
  // data.log_id
});
```

**Start Camera (Frontend Request)**
```javascript
socket.emit('start_camera', {
  camera_id: 1
});
```

---

## Autonomous Detection

### How It Works

SmartSurveil operates as a **true autonomous surveillance system**. The backend continuously monitors all active cameras and detects intruders **without requiring the frontend to be running**.

### Auto-Start on Backend Launch

When you start the backend:
1. Database is loaded
2. All cameras are queried
3. Detection threads start for each **active** camera
4. Each thread runs independently, processing frames and detecting persons

### Detection Process

**Per Camera Thread:**
```
Loop Forever:
  1. Check if camera is active
  2. Capture frame from stream
  3. Preprocess frame (resize)
  4. Run YOLOv8 detection on ROI
  5. If person detected:
     a. Check detection interval (prevent spam)
     b. Save alert image with annotations
     c. Log intrusion to database
     d. Send email alert (background thread)
     e. Emit WebSocket event (if clients connected)
  6. Try to stream frame to frontend (optional)
  7. Sleep 33ms (30 FPS)
```

### Key Features

**Independent Operation:**
- Detection runs 24/7 without frontend
- Email alerts sent automatically
- All intrusions logged to database
- Frontend is optional for monitoring

**Graceful Degradation:**
- WebSocket emissions wrapped in try-except
- Frame streaming only when clients connected
- Detection continues even if email fails
- Automatic camera reconnection

**Resource Efficiency:**
- Frames only encoded when clients viewing
- Configurable frame rate and resolution
- GPU acceleration support (optional)
- Lightweight threading model

### Frontend as Accessibility Tool

The frontend serves as an **optional interface** for:
- Live viewing of camera feeds
- Reviewing intrusion logs
- Managing camera settings
- Receiving real-time notifications
- Interactive ROI configuration

**Detection continues even when frontend is closed!**

---

## Troubleshooting

### Backend Issues

**Problem: Backend won't start**
```
Solution:
1. Check Python version: python --version (need 3.8+)
2. Verify virtual environment is activated
3. Reinstall dependencies: pip install -r requirements.txt
4. Check port 5000 is not in use
```

**Problem: Camera won't connect**
```
Solution:
1. Verify camera URL is correct
2. Test URL with VLC or ffplay
3. Check network connectivity
4. For RTSP: verify username/password
5. For webcam: ensure not used by another app
```

**Problem: No detections happening**
```
Solution:
1. Check camera is marked as active
2. Verify detection_enabled=true
3. Check ROI is set correctly (not 0,0,0,0)
4. Lower CONFIDENCE_THRESHOLD in config.py
5. Check console for detection logs
```

**Problem: Email alerts not sending**
```
Solution:
1. Verify EMAIL_ADDRESS and EMAIL_PASSWORD in .env
2. Use app-specific password for Gmail
3. Check SMTP_SERVER and SMTP_PORT
4. Test email credentials manually
5. Check console for email errors
```

**Problem: High CPU usage**
```
Solution:
1. Reduce FRAME_WIDTH in config.py
2. Increase sleep time in detection loop
3. Disable unused cameras
4. Use GPU if available (USE_GPU=True)
5. Lower STREAM_FPS
```

### Frontend Issues

**Problem: Frontend won't start**
```
Solution:
1. Check Node.js version: node --version (need 16+)
2. Delete node_modules and package-lock.json
3. Run: npm install
4. Check port 8080 is not in use
```

**Problem: Can't connect to backend**
```
Solution:
1. Verify backend is running
2. Check backend URL in frontend config
3. Check CORS settings in backend
4. Clear browser cache
5. Check browser console for errors
```

**Problem: No live video feed**
```
Solution:
1. Check camera is active and streaming
2. Verify WebSocket connection in browser console
3. Check network connectivity
4. Try refreshing the page
5. Check browser supports WebSocket
```

### Database Issues

**Problem: Database locked**
```
Solution:
1. Close all connections to database
2. Restart backend
3. Check file permissions
4. Delete smartsurveil.db and restart (loses data)
```

**Problem: Corrupted database**
```
Solution:
1. Backup smartsurveil.db
2. Try: sqlite3 smartsurveil.db "PRAGMA integrity_check;"
3. If corrupted, delete and restart backend
```

---

## Deployment

### Running as a Service

#### Linux (systemd)

1. **Create service file**
```bash
sudo nano /etc/systemd/system/smartsurveil.service
```

2. **Add configuration**
```ini
[Unit]
Description=SmartSurveil Intrusion Detection Backend
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/SmartSurveil/backend
Environment="PATH=/path/to/SmartSurveil/backend/venv/bin"
ExecStart=/path/to/SmartSurveil/backend/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. **Enable and start**
```bash
sudo systemctl daemon-reload
sudo systemctl enable smartsurveil
sudo systemctl start smartsurveil
sudo systemctl status smartsurveil
```

4. **View logs**
```bash
sudo journalctl -u smartsurveil -f
```

#### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. **Trigger:** At system startup
4. **Action:** Start a program
   - Program: `C:\path\to\SmartSurveil\backend\venv\Scripts\python.exe`
   - Arguments: `app.py`
   - Start in: `C:\path\to\SmartSurveil\backend`
5. **Settings:**
   - Run whether user is logged on or not
   - Run with highest privileges
   - Configure for: Windows 10

### Production Deployment

#### Backend (Production WSGI)

**Using Gunicorn (Linux):**
```bash
pip install gunicorn

gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app
```

**Using Waitress (Windows):**
```bash
pip install waitress

waitress-serve --host 0.0.0.0 --port 5000 app:app
```

#### Frontend (Static Hosting)

1. **Build for production**
```bash
cd react-frontend
npm run build
```

2. **Deploy to hosting**
- Copy `dist/` folder to web server
- Configure nginx/Apache to serve static files
- Set up reverse proxy to backend

**Nginx example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/SmartSurveil/react-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Security Considerations

1. **Change SECRET_KEY** in production
2. **Use HTTPS** for frontend and backend
3. **Restrict CORS** origins in production
4. **Use strong passwords** for user accounts
5. **Secure camera credentials** (use environment variables)
6. **Enable firewall** rules
7. **Regular backups** of database and alert images
8. **Monitor logs** for suspicious activity
9. **Update dependencies** regularly
10. **Use app-specific passwords** for email

### Performance Optimization

1. **Use GPU** if available (set USE_GPU=True)
2. **Reduce frame resolution** for faster processing
3. **Increase detection interval** to reduce alerts
4. **Use smaller YOLO model** (yolov8n vs yolov8x)
5. **Limit concurrent cameras** based on hardware
6. **Use SSD** for database and alert storage
7. **Monitor system resources** (CPU, RAM, disk)

---

## Technology Stack

### Backend
- **Framework:** Flask 3.0
- **WebSocket:** Flask-SocketIO 5.3
- **AI Model:** YOLOv8 (Ultralytics)
- **Computer Vision:** OpenCV 4.8
- **Database:** SQLite 3
- **Authentication:** JWT (PyJWT)
- **Password Hashing:** bcrypt
- **Email:** smtplib (built-in)

### Frontend
- **Framework:** React 18.3
- **Build Tool:** Vite 5.4
- **UI Components:** Radix UI + shadcn/ui
- **Styling:** TailwindCSS 3.4
- **Icons:** Lucide React
- **WebSocket:** Socket.IO Client 4.8
- **Routing:** React Router 6.30
- **State Management:** React Query (TanStack)
- **Forms:** React Hook Form + Zod

### Development Tools
- **Language:** Python 3.8+, TypeScript 5.8
- **Package Managers:** pip, npm
- **Linting:** ESLint
- **Type Checking:** TypeScript

---

## License

MIT License - Free to use and modify

---

## Support

For issues and questions:
1. Check this documentation
2. Review console logs for errors
3. Check GitHub issues (if applicable)
4. Verify configuration settings

---

**Built with ❤️ for enhanced security**

*SmartSurveil - Autonomous Intrusion Detection System*
