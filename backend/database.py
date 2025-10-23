import sqlite3
from datetime import datetime
import bcrypt
from config import Config

class Database:
    """Database handler for SmartSurveil"""

    def __init__(self):
        self.db_path = Config.DATABASE_PATH
        self.init_database()

    def get_connection(self):
        """Create database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Cameras table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cameras (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                detection_enabled BOOLEAN DEFAULT 1,
                roi_x INTEGER DEFAULT 0,
                roi_y INTEGER DEFAULT 0,
                roi_width INTEGER DEFAULT 640,
                roi_height INTEGER DEFAULT 480,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')

        # Intrusion logs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS intrusion_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                camera_id INTEGER NOT NULL,
                image_path TEXT NOT NULL,
                detection_count INTEGER DEFAULT 1,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (camera_id) REFERENCES cameras (id)
            )
        ''')

        conn.commit()
        conn.close()

    def create_user(self, username, email, password):
        """Create new user"""
        conn = self.get_connection()
        cursor = conn.cursor()

        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        try:
            cursor.execute(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                (username, email, password_hash)
            )
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()
            return {'success': True, 'user_id': user_id}
        except sqlite3.IntegrityError:
            conn.close()
            return {'success': False, 'error': 'Username or email already exists'}

    def verify_user(self, username, password):
        """Verify user credentials"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
            return {'success': True, 'user': dict(user)}
        return {'success': False, 'error': 'Invalid credentials'}

    def add_camera(self, user_id, name, url):
        """Add new camera"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            'INSERT INTO cameras (user_id, name, url) VALUES (?, ?, ?)',
            (user_id, name, url)
        )
        conn.commit()
        camera_id = cursor.lastrowid
        conn.close()
        return camera_id

    def get_user_cameras(self, user_id):
        """Get all cameras for user"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM cameras WHERE user_id = ?', (user_id,))
        cameras = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return cameras

    def update_camera_status(self, camera_id, is_active):
        """Update camera active status"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            'UPDATE cameras SET is_active = ? WHERE id = ?',
            (is_active, camera_id)
        )
        conn.commit()
        conn.close()

    def toggle_detection(self, camera_id, enabled):
        """Toggle detection for camera"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            'UPDATE cameras SET detection_enabled = ? WHERE id = ?',
            (enabled, camera_id)
        )
        conn.commit()
        conn.close()

    def update_roi(self, camera_id, x, y, width, height):
        """Update ROI for camera"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            '''UPDATE cameras 
               SET roi_x = ?, roi_y = ?, roi_width = ?, roi_height = ? 
               WHERE id = ?''',
            (x, y, width, height, camera_id)
        )
        conn.commit()
        conn.close()

    def get_camera(self, camera_id):
        """Get camera by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM cameras WHERE id = ?', (camera_id,))
        camera = cursor.fetchone()
        conn.close()
        return dict(camera) if camera else None

    def delete_camera(self, camera_id):
        """Delete camera and its associated logs"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Delete associated intrusion logs first (foreign key constraint)
        cursor.execute('DELETE FROM intrusion_logs WHERE camera_id = ?', (camera_id,))
        
        # Delete the camera
        cursor.execute('DELETE FROM cameras WHERE id = ?', (camera_id,))
        
        conn.commit()
        deleted_count = cursor.rowcount
        conn.close()
        return deleted_count > 0

    def log_intrusion(self, camera_id, image_path, detection_count):
        """Log intrusion detection"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            'INSERT INTO intrusion_logs (camera_id, image_path, detection_count) VALUES (?, ?, ?)',
            (camera_id, image_path, detection_count)
        )
        conn.commit()
        log_id = cursor.lastrowid
        conn.close()
        return log_id

    def get_intrusion_logs(self, user_id, limit=50):
        """Get intrusion logs for user's cameras"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT il.*, c.name as camera_name
            FROM intrusion_logs il
            JOIN cameras c ON il.camera_id = c.id
            WHERE c.user_id = ?
            ORDER BY il.timestamp DESC
            LIMIT ?
        ''', (user_id, limit))

        logs = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return logs
