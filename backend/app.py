from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import jwt
from functools import wraps
import threading
import time
import cv2
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from datetime import datetime, timedelta

from config import Config
from database import Database
from detection import IntrusionDetector, CameraStream

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

db = Database()
detector = IntrusionDetector()

active_streams = {}
stream_threads = {}


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]

            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['user_id']
        except:
            return jsonify({'error': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)

    return decorated


def send_email_alert(camera_name, image_path, detection_count):
    """Send email alert with image"""
    try:
        if not Config.EMAIL_ADDRESS or not Config.EMAIL_PASSWORD:
            print("Email not configured. Skipping email alert.")
            return

        msg = MIMEMultipart()
        msg['From'] = Config.EMAIL_ADDRESS
        msg['To'] = Config.EMAIL_ADDRESS
        msg['Subject'] = f"SmartSurveil Alert - {camera_name}"

        body = f"""
        INTRUSION DETECTED!

        Camera: {camera_name}
        Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        Persons Detected: {detection_count}

        Please check your dashboard for more details.
        """
        msg.attach(MIMEText(body, 'plain'))

        with open(image_path, 'rb') as f:
            img = MIMEImage(f.read())
            img.add_header('Content-Disposition', 'attachment', filename='intrusion.jpg')
            msg.attach(img)

        server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.EMAIL_ADDRESS, Config.EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()

        print(f"Alert email sent for camera {camera_name}")
    except Exception as e:
        print(f"Error sending email: {e}")


def process_camera_stream(camera_id):
    """Process camera stream and detect intrusions"""
    camera = db.get_camera(camera_id)
    if not camera:
        return

    stream = CameraStream(camera['url'])
    if not stream.connect():
        print(f"Failed to connect to camera {camera_id}")
        return

    active_streams[camera_id] = stream
    last_detection_time = 0

    try:
        while active_streams.get(camera_id) == stream:
            camera = db.get_camera(camera_id)

            if not camera['is_active']:
                time.sleep(1)
                continue

            frame = stream.read_frame()
            if frame is None:
                time.sleep(0.1)
                continue

            frame = detector.preprocess_frame(frame)

            person_count = 0
            if camera['detection_enabled']:
                roi = {
                    'x': camera['roi_x'],
                    'y': camera['roi_y'],
                    'width': camera['roi_width'],
                    'height': camera['roi_height']
                }

                person_count, annotated_frame, alert_image = detector.detect_persons_in_roi(frame, roi)

                if person_count > 0:
                    current_time = time.time()
                    if current_time - last_detection_time > Config.DETECTION_INTERVAL:
                        last_detection_time = current_time

                        image_path = detector.save_alert_image(alert_image, camera_id)
                        log_id = db.log_intrusion(camera_id, image_path, person_count)

                        threading.Thread(
                            target=send_email_alert,
                            args=(camera['name'], image_path, person_count)
                        ).start()

                        socketio.emit('intrusion_detected', {
                            'camera_id': camera_id,
                            'camera_name': camera['name'],
                            'person_count': person_count,
                            'timestamp': datetime.now().isoformat(),
                            'log_id': log_id
                        })

                frame = annotated_frame

            _, buffer = cv2.imencode('.jpg', frame)
            frame_data = base64.b64encode(buffer).decode('utf-8')

            socketio.emit(f'camera_frame_{camera_id}', {
                'frame': frame_data,
                'timestamp': time.time()
            })

            time.sleep(0.033)

    finally:
        stream.release()
        if camera_id in active_streams:
            del active_streams[camera_id]


@app.route('/api/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    result = db.create_user(username, email, password)

    if result['success']:
        return jsonify({'message': 'User created successfully'}), 201
    else:
        return jsonify({'error': result['error']}), 400


@app.route('/api/login', methods=['POST'])
def login():
    """User login"""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return jsonify({'error': 'Missing credentials'}), 400

    result = db.verify_user(username, password)

    if result['success']:
        token = jwt.encode({
            'user_id': result['user']['id'],
            'username': result['user']['username'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'token': token,
            'user': {
                'id': result['user']['id'],
                'username': result['user']['username'],
                'email': result['user']['email']
            }
        }), 200
    else:
        return jsonify({'error': result['error']}), 401


@app.route('/api/cameras', methods=['GET'])
@token_required
def get_cameras(current_user):
    """Get user's cameras"""
    cameras = db.get_user_cameras(current_user)
    return jsonify({'cameras': cameras}), 200


@app.route('/api/cameras', methods=['POST'])
@token_required
def add_camera(current_user):
    """Add new camera"""
    data = request.json
    name = data.get('name')
    url = data.get('url')

    if not all([name, url]):
        return jsonify({'error': 'Missing required fields'}), 400

    camera_id = db.add_camera(current_user, name, url)

    thread = threading.Thread(target=process_camera_stream, args=(camera_id,))
    thread.daemon = True
    thread.start()
    stream_threads[camera_id] = thread

    return jsonify({
        'message': 'Camera added successfully',
        'camera_id': camera_id
    }), 201


@app.route('/api/cameras/<int:camera_id>/toggle', methods=['POST'])
@token_required
def toggle_camera(current_user, camera_id):
    """Toggle camera active status"""
    data = request.json
    is_active = data.get('is_active', True)

    db.update_camera_status(camera_id, is_active)
    return jsonify({'message': 'Camera status updated'}), 200


@app.route('/api/cameras/<int:camera_id>/detection', methods=['POST'])
@token_required
def toggle_detection(current_user, camera_id):
    """Toggle detection for camera"""
    data = request.json
    enabled = data.get('enabled', True)

    db.toggle_detection(camera_id, enabled)
    return jsonify({'message': 'Detection status updated'}), 200


@app.route('/api/cameras/<int:camera_id>/roi', methods=['POST'])
@token_required
def set_roi(current_user, camera_id):
    """Set ROI for camera"""
    data = request.json
    x = data.get('x', 0)
    y = data.get('y', 0)
    width = data.get('width', 640)
    height = data.get('height', 480)

    db.update_roi(camera_id, x, y, width, height)
    return jsonify({'message': 'ROI updated'}), 200


@app.route('/api/logs', methods=['GET'])
@token_required
def get_logs(current_user):
    """Get intrusion logs"""
    limit = request.args.get('limit', 50, type=int)
    logs = db.get_intrusion_logs(current_user, limit)
    return jsonify({'logs': logs}), 200


@app.route('/api/alerts/<path:filename>')
def get_alert_image(filename):
    """Serve alert images"""
    return send_from_directory(Config.ALERT_IMAGES_PATH, filename)


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('start_camera')
def handle_start_camera(data):
    """Start camera stream"""
    camera_id = data.get('camera_id')
    if camera_id and camera_id not in active_streams:
        thread = threading.Thread(target=process_camera_stream, args=(camera_id,))
        thread.daemon = True
        thread.start()
        stream_threads[camera_id] = thread


if __name__ == '__main__':
    print("=" * 60)
    print("SmartSurveil Backend Starting...")
    print("=" * 60)
    print(f"Server running on http://localhost:5000")
    print(f"API endpoints available at http://localhost:5000/api")
    print("Press CTRL+C to stop the server")
    print("=" * 60)
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
