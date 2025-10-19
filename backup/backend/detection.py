import cv2
import numpy as np
from ultralytics import YOLO
import time
from datetime import datetime
import os
from config import Config

class IntrusionDetector:
    """Human detection using YOLOv8 from Ultralytics"""

    def __init__(self):
        print("Loading YOLOv8 model...")
        self.model = YOLO(Config.MODEL_NAME)  # Auto-downloads from Ultralytics
        print("YOLOv8 model loaded successfully!")

        self.person_class_id = Config.PERSON_CLASS_ID
        self.confidence_threshold = Config.CONFIDENCE_THRESHOLD

        os.makedirs(Config.ALERT_IMAGES_PATH, exist_ok=True)

    def detect_persons_in_roi(self, frame, roi):
        """Detect persons in region of interest"""
        x, y, w, h = roi['x'], roi['y'], roi['width'], roi['height']

        frame_h, frame_w = frame.shape[:2]
        x = max(0, min(x, frame_w - 1))
        y = max(0, min(y, frame_h - 1))
        w = min(w, frame_w - x)
        h = min(h, frame_h - y)

        roi_frame = frame[y:y+h, x:x+w]

        if roi_frame.size == 0:
            return 0, frame, None

        results = self.model.predict(
            roi_frame,
            conf=self.confidence_threshold,
            classes=[self.person_class_id],
            verbose=False,
            device='cuda' if Config.USE_GPU else 'cpu'
        )

        person_count = 0
        detections = []

        if len(results) > 0:
            result = results[0]
            boxes = result.boxes

            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                if class_id == self.person_class_id and confidence >= self.confidence_threshold:
                    person_count += 1
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    detections.append({
                        'bbox': [x1, y1, x2, y2],
                        'confidence': confidence
                    })

        annotated_frame = self.annotate_frame(frame.copy(), roi, detections, person_count)

        alert_image = None
        if person_count > 0:
            alert_image = self.create_alert_image(roi_frame, detections, person_count)

        return person_count, annotated_frame, alert_image

    def annotate_frame(self, frame, roi, detections, person_count):
        """Draw ROI and detections on frame"""
        x, y, w, h = roi['x'], roi['y'], roi['width'], roi['height']

        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 255), 2)
        cv2.putText(frame, 'ROI', (x, y - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            x1_full = x + x1
            y1_full = y + y1
            x2_full = x + x2
            y2_full = y + y2

            cv2.rectangle(frame, (x1_full, y1_full), (x2_full, y2_full), (0, 0, 255), 2)
            conf_text = f"Person {det['confidence']:.2f}"
            cv2.putText(frame, conf_text, (x1_full, y1_full - 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        if person_count > 0:
            alert_text = f"ALERT: {person_count} person(s) detected!"
            cv2.putText(frame, alert_text, (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

        return frame

    def create_alert_image(self, roi_frame, detections, person_count):
        """Create alert image with detections"""
        alert_img = roi_frame.copy()

        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            cv2.rectangle(alert_img, (x1, y1), (x2, y2), (0, 0, 255), 2)

        text = f"INTRUSION: {person_count} person(s)"
        cv2.putText(alert_img, text, (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(alert_img, timestamp, (10, alert_img.shape[0] - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        return alert_img

    def save_alert_image(self, image, camera_id):
        """Save alert image to disk"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"camera_{camera_id}_{timestamp}.jpg"
        filepath = os.path.join(Config.ALERT_IMAGES_PATH, filename)
        cv2.imwrite(filepath, image)
        return filepath

    def preprocess_frame(self, frame):
        """Preprocess frame for detection"""
        if frame is None:
            return None

        frame_h, frame_w = frame.shape[:2]

        if frame_w > Config.FRAME_WIDTH:
            aspect_ratio = frame_h / frame_w
            new_width = Config.FRAME_WIDTH
            new_height = int(new_width * aspect_ratio)
            frame = cv2.resize(frame, (new_width, new_height))

        return frame


class CameraStream:
    """Handle camera stream capture"""

    def __init__(self, camera_url):
        self.camera_url = camera_url
        self.cap = None
        self.is_running = False

    def connect(self):
        """Connect to camera stream"""
        try:
            if self.camera_url == '0' or self.camera_url == 0:
                self.camera_url = 0

            self.cap = cv2.VideoCapture(self.camera_url)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            if self.cap.isOpened():
                self.is_running = True
                print(f"Connected to camera: {self.camera_url}")
                return True
            return False
        except Exception as e:
            print(f"Error connecting to camera: {e}")
            return False

    def read_frame(self):
        """Read frame from camera"""
        if self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if ret and frame is not None:
                return frame
        return None

    def release(self):
        """Release camera connection"""
        if self.cap:
            self.cap.release()
        self.is_running = False

    def __del__(self):
        self.release()
