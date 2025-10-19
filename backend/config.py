import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""

    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

    # Database
    DATABASE_PATH = 'smartsurveil.db'

    # SMTP Email Configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS', '')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')

    # YOLOv8 Model Configuration
    MODEL_NAME = 'yolov8n.pt'  # Auto-downloads from Ultralytics
    CONFIDENCE_THRESHOLD = 0.5

    # Detection Settings
    PERSON_CLASS_ID = 0  # COCO dataset person class
    DETECTION_INTERVAL = 300  # seconds between alerts

    # Frame Processing
    FRAME_WIDTH = 640
    FRAME_HEIGHT = 480

    # Storage
    ALERT_IMAGES_PATH = 'alerts'

    # WebSocket
    SOCKETIO_CORS_ALLOWED_ORIGINS = "*"

    # Camera Settings
    CAMERA_RECONNECT_ATTEMPTS = 3
    CAMERA_RECONNECT_DELAY = 2

    # Performance
    USE_GPU = False  # Set to True if CUDA available
    STREAM_FPS = 30
