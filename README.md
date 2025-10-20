# 🎥 SmartSurveil - Cloud-Based Intrusion Detection System

## Overview

SmartSurveil is a real-time intrusion detection system that uses YOLOv8 AI to detect human presence in CCTV camera feeds. It works with your existing camera infrastructure and provides instant alerts.

## Key Features

- ✅ **Real-time Human Detection** using YOLOv8
- ✅ **Multiple Camera Support** with concurrent processing
- ✅ **Region of Interest (ROI)** configuration per camera
- ✅ **Live Video Streaming** to web dashboard
- ✅ **Email Alerts** with captured images
- ✅ **User Authentication** with JWT tokens
- ✅ **Intrusion Logging** and history
- ✅ **Pause/Resume Detection** per camera
- ✅ **Responsive Web Interface**

## Quick Start

### 1. Install Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 2. Start Frontend

```bash
cd react-frontend
npm run dev
```

### 3. Open Browser

Go to `http://localhost:8080` and register an account!

## System Requirements

- Python 3.8+
- 4GB RAM (8GB recommended)
- Webcam or IP camera
- Modern web browser

## Camera URLs

- **Webcam:** `0`
- **RTSP:** `rtsp://user:pass@192.168.1.100:554/stream`
- **HTTP:** `http://192.168.1.100:8080/video`

## Documentation

See `SETUP_GUIDE.txt` for complete installation and usage instructions.

## Technology Stack

- **Backend:** Python, Flask, YOLOv8, OpenCV, SQLite
- **Frontend:** HTML5, CSS3, JavaScript, Socket.IO
- **AI:** YOLOv8 (Ultralytics)

## License

MIT License - Free to use and modify

## Support

Check SETUP_GUIDE.txt for troubleshooting and configuration options.

---

**Built with ❤️ for enhanced security**
