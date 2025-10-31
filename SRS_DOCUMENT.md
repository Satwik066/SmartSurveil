# Software Requirements Specification (SRS)
## SmartSurveil - Autonomous Intrusion Detection System

**Version:** 1.0  
**Date:** October 31, 2025  
**Prepared by:** Development Team  
**Project:** SmartSurveil

---

## Table of Contents

### Chapter 1: Introduction
1.1 Introduction to SRS  
1.2 Role of SRS  
1.3 Requirements Specification Document  
1.4 Purpose  
1.5 Scope  
1.6 Definitions, Acronyms, and Abbreviations  
1.7 References  
1.8 Overview  

### Chapter 2: Overall Description
2.1 Product Perspective  
2.2 Product Functions  
2.3 User Classes and Characteristics  
2.4 Operating Environment  
2.5 Design and Implementation Constraints  
2.6 Assumptions and Dependencies  

### Chapter 3: Functional Requirements
3.1 User Management  
3.2 Camera Operations  
3.3 Detection Operations  
3.4 Log Operations  
3.5 Real-Time Communication  

### Chapter 4: Non-Functional Requirements
4.1 Performance Requirements  
4.2 Security Requirements  
4.3 Reliability Requirements  
4.4 Availability Requirements  
4.5 Maintainability Requirements  
4.6 Portability Requirements  
4.7 Scalability Requirements  
4.8 Usability Requirements  

### Chapter 5: Hardware and Software Requirements
5.1 Hardware Requirements  
5.2 Software Requirements  
5.3 Network Requirements  
5.4 Camera Requirements  

### Chapter 6: System Features
6.1 Autonomous Detection Engine  
6.2 Alert Management System  
6.3 Camera Management  
6.4 User Authentication  
6.5 Intrusion Logging  
6.6 Live Monitoring Dashboard  
6.7 ROI Configuration  
6.8 Advanced Detection Settings  

### Chapter 7: External Interface Requirements
7.1 User Interfaces  
7.2 Hardware Interfaces  
7.3 Software Interfaces  
7.4 Communication Interfaces  

### Chapter 8: System Models
8.1 Use Case Diagram  
8.2 Data Flow Diagram  
8.3 State Diagram  
8.4 Entity-Relationship Diagram  
8.5 Sequence Diagrams  

### Appendices
Appendix A: API Endpoints  
Appendix B: Database Schema  

---

## Chapter 1: Introduction

### 1.1 Introduction to SRS

A Software Requirements Specification (SRS) is a comprehensive description of the intended purpose and environment for software under development. The SRS fully describes what the software will do and how it will be expected to perform.

This document provides a detailed specification for the SmartSurveil autonomous intrusion detection system, outlining both functional and non-functional requirements. It serves as a foundation for the design, development, testing, and validation phases of the project.

### 1.2 Role of SRS

The SRS plays a critical role in the software development lifecycle:

**For Developers:**
- Provides clear understanding of system requirements
- Serves as a reference during implementation
- Helps in making design decisions
- Reduces ambiguity in requirements

**For Testers:**
- Forms the basis for test case development
- Defines acceptance criteria
- Enables validation of system functionality
- Provides traceability matrix foundation

**For Project Managers:**
- Facilitates project planning and estimation
- Helps in resource allocation
- Enables progress tracking
- Serves as contractual agreement

**For Stakeholders:**
- Ensures common understanding of system capabilities
- Provides basis for approval and sign-off
- Enables early detection of requirement issues
- Facilitates change management

### 1.3 Requirements Specification Document

This Requirements Specification Document describes all the requirements for the SmartSurveil system. It includes:

- **Functional Requirements:** What the system must do
- **Non-Functional Requirements:** How the system must perform
- **Interface Requirements:** How the system interacts with external entities
- **System Features:** Detailed description of capabilities
- **Constraints:** Limitations and restrictions
- **Assumptions:** Conditions assumed to be true

The document follows IEEE 830-1998 recommended practices for software requirements specifications.

### 1.4 Purpose

The purpose of this Software Requirements Specification is to:

1. **Define System Scope:** Clearly establish what SmartSurveil will and will not do
2. **Specify Requirements:** Document all functional and non-functional requirements
3. **Establish Agreement:** Create a common understanding among all stakeholders
4. **Provide Development Baseline:** Serve as the foundation for system design
5. **Enable Validation:** Provide criteria for system testing and acceptance
6. **Support Maintenance:** Document system behavior for future enhancements

**Target Audience:**
- Software developers and architects
- Quality assurance and testing teams
- Project managers and coordinators
- System administrators
- End users and stakeholders
- Maintenance and support personnel

### 1.5 Scope

**Product Name:** SmartSurveil - Autonomous Intrusion Detection System

**Product Overview:**

SmartSurveil is an AI-powered, autonomous surveillance system that provides 24/7 monitoring of CCTV camera feeds to detect human intrusions using YOLOv8 deep learning technology.

**Key Capabilities:**

1. **Autonomous Operation** - 24/7 monitoring without human intervention
2. **AI-Powered Detection** - YOLOv8 object detection with configurable confidence
3. **Multi-Camera Support** - Unlimited concurrent camera streams
4. **Intelligent Alerting** - Email notifications with captured images
5. **Comprehensive Logging** - Database storage of all detection events
6. **User Management** - Secure authentication and multi-user support
7. **Web Dashboard** - Optional real-time monitoring interface

**Benefits:**
- Enhanced security through automated monitoring
- Cost-effective alternative to human security personnel
- Accurate AI-based detection reduces false alarms
- Immediate incident notification
- Scalable to multiple camera installations
- Customizable detection zones and sensitivity

**Out of Scope:**
- Facial recognition or identification
- Vehicle detection and license plate recognition
- Audio detection or analysis
- Video recording and playback
- Mobile applications (iOS/Android)
- Cloud storage integration

### 1.6 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **AI** | Artificial Intelligence |
| **API** | Application Programming Interface |
| **FPS** | Frames Per Second |
| **GPU** | Graphics Processing Unit |
| **JWT** | JSON Web Token |
| **REST** | Representational State Transfer |
| **ROI** | Region of Interest (detection zone) |
| **RTSP** | Real-Time Streaming Protocol |
| **SMTP** | Simple Mail Transfer Protocol |
| **SQL** | Structured Query Language |
| **SRS** | Software Requirements Specification |
| **UI** | User Interface |
| **WebSocket** | Full-duplex communication protocol |
| **YOLO** | You Only Look Once (object detection algorithm) |

### 1.7 References

1. YOLOv8 Documentation - Ultralytics
2. Flask Framework Documentation
3. React Documentation
4. Socket.IO Documentation
5. OpenCV Documentation
6. IEEE Std 830-1998 - IEEE Recommended Practice for SRS
7. SQLite Documentation
8. JWT Specification - RFC 7519

### 1.8 Overview

This SRS document is organized into eight main chapters:

- **Chapter 1:** Introduction and document overview
- **Chapter 2:** Overall system description and context
- **Chapter 3:** Functional requirements by subsystem
- **Chapter 4:** Non-functional quality requirements
- **Chapter 5:** Hardware and software requirements
- **Chapter 6:** Detailed system features
- **Chapter 7:** External interface specifications
- **Chapter 8:** System models and diagrams

---

## Chapter 2: Overall Description

### 2.1 Product Perspective

SmartSurveil is a standalone system that integrates with existing CCTV infrastructure. It consists of:

**Backend (Core):**
- Flask-based REST API
- YOLOv8 detection engine
- SQLite database
- Email alert system
- WebSocket server

**Frontend (Optional):**
- React-based web dashboard
- Real-time video streaming
- Camera management interface
- Intrusion log viewer

**External Interfaces:**
- RTSP/HTTP camera streams
- SMTP email server
- Web browsers

### 2.2 Product Functions

Major functions include:

1. **Autonomous Detection** - 24/7 AI-based monitoring
2. **Multi-Camera Management** - Unlimited concurrent cameras
3. **Alert System** - Email notifications with images
4. **Detection Configuration** - Per-camera sensitivity settings
5. **User Management** - Secure authentication
6. **Intrusion Logging** - Comprehensive event logging
7. **Live Monitoring** - Optional real-time dashboard
8. **ROI Configuration** - Define monitoring zones

### 2.3 User Classes and Characteristics

**System Administrator:**
- Technical expertise: High
- Responsibilities: Installation, configuration, maintenance
- Frequency: Occasional

**End User (Property Owner):**
- Technical expertise: Low to Medium
- Responsibilities: Monitor alerts, manage cameras
- Frequency: Daily

**Security Personnel:**
- Technical expertise: Medium
- Responsibilities: Review logs, respond to alerts
- Frequency: Regular shifts

### 2.4 Operating Environment

**Hardware Requirements (Minimum):**
- Dual-core CPU, 2.0 GHz
- 4 GB RAM
- 10 GB storage
- 100 Mbps network

**Hardware Requirements (Recommended):**
- Quad-core CPU, 3.0 GHz
- 8 GB RAM
- 50 GB SSD
- Gigabit Ethernet
- NVIDIA GPU (optional)

**Software Requirements:**
- OS: Windows 10+, Linux (Ubuntu 20.04+), macOS 10.15+
- Python 3.8+
- Node.js 16+ (for frontend)
- Modern web browser

### 2.5 Design and Implementation Constraints

**Technical Constraints:**
- Python backend, TypeScript/JavaScript frontend
- YOLOv8 AI framework mandatory
- SQLite database only
- WebSocket for real-time communication

**Regulatory Constraints:**
- Privacy and surveillance law compliance
- GDPR compliance for EU deployments
- User consent requirements

**Performance Constraints:**
- Maximum 30 FPS per camera
- Detection latency < 1 second
- Support 4+ concurrent 1080p streams

**Security Constraints:**
- Bcrypt password hashing
- JWT authentication
- HTTPS recommended for production
- SQL injection prevention

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have basic computer literacy
- Cameras are network-accessible
- Email server credentials available
- Continuous power and network connectivity

**Dependencies:**
- Python libraries: Flask, OpenCV, Ultralytics, PyTorch
- YOLOv8 model weights
- SMTP server access
- Standard camera protocols (RTSP/HTTP)

---

## Chapter 3: Functional Requirements

### 3.1 User Management

**FR-UR-1:** System SHALL provide user registration endpoint  
**FR-UR-2:** Registration SHALL require username, email, password  
**FR-UR-3:** System SHALL validate email format  
**FR-UR-4:** System SHALL check for duplicate username/email  
**FR-UR-5:** System SHALL hash passwords using bcrypt  
**FR-UL-1:** System SHALL provide user login endpoint  
**FR-UL-2:** System SHALL verify credentials against database  
**FR-UL-3:** System SHALL issue JWT token on successful login  
**FR-UL-4:** System SHALL return user information with token  
**FR-SM-1:** JWT tokens SHALL include user ID and username  
**FR-SM-2:** JWT tokens SHALL expire after 24 hours  
**FR-SM-3:** System SHALL validate token on each API request  

### 3.2 Camera Operations

**FR-AC-1:** System SHALL provide add camera endpoint  
**FR-AC-2:** Add camera SHALL require name and URL  
**FR-AC-3:** System SHALL associate camera with authenticated user  
**FR-AC-4:** System SHALL start detection thread for new camera  
**FR-LC-1:** System SHALL provide list cameras endpoint  
**FR-LC-2:** List SHALL include all camera properties  
**FR-LC-3:** List SHALL filter by user ownership  
**FR-UC-1:** System SHALL provide update camera endpoint  
**FR-UC-2:** Users SHALL update camera name and URL  
**FR-UC-3:** Users SHALL toggle camera active status  
**FR-UC-4:** Users SHALL toggle detection enabled status  
**FR-UC-5:** Users SHALL update ROI coordinates  
**FR-UC-6:** Users SHALL update confidence threshold  
**FR-UC-7:** Users SHALL update alert interval  
**FR-DC-1:** System SHALL provide delete camera endpoint  
**FR-DC-2:** System SHALL stop stream before deletion  
**FR-DC-3:** System SHALL delete associated logs  

### 3.3 Detection Operations

**FR-FP-1:** System SHALL capture frames from camera stream  
**FR-FP-2:** System SHALL preprocess frames (resize if needed)  
**FR-FP-3:** System SHALL extract ROI from frame  
**FR-FP-4:** System SHALL run YOLO detection on ROI  
**FR-FP-5:** System SHALL filter by confidence threshold  
**FR-FP-6:** System SHALL count detected persons  
**FR-AG-1:** System SHALL check alert interval before sending  
**FR-AG-2:** System SHALL create annotated alert image  
**FR-AG-3:** System SHALL save alert image to disk  
**FR-AG-4:** System SHALL log detection to database  
**FR-AG-5:** System SHALL send email alert asynchronously  
**FR-AG-6:** System SHALL emit WebSocket alert event  

### 3.4 Log Operations

**FR-RL-1:** System SHALL provide retrieve logs endpoint  
**FR-RL-2:** Logs SHALL filter by user ownership  
**FR-RL-3:** Logs SHALL sort by timestamp descending  
**FR-RL-4:** Logs SHALL support configurable limit  
**FR-SAI-1:** System SHALL provide serve alert images endpoint  
**FR-SAI-2:** Images SHALL serve from configured directory  

### 3.5 Real-Time Communication

**FR-VS-1:** System SHALL encode frames as JPEG  
**FR-VS-2:** System SHALL encode as base64  
**FR-VS-3:** System SHALL emit via WebSocket  
**FR-VS-4:** System SHALL emit only when clients connected  
**FR-AB-1:** System SHALL broadcast intrusion alerts  
**FR-AB-2:** Alerts SHALL include camera and detection details  

---

## Chapter 4: Non-Functional Requirements

### 4.1 Performance Requirements

**NFR-P-1:** System SHALL process ≥30 FPS per camera  
**NFR-P-2:** Detection latency SHALL be ≤1 second  
**NFR-P-3:** Email alerts SHALL be sent within 5 seconds  
**NFR-P-4:** API response time SHALL be ≤500ms  
**NFR-P-5:** Video stream latency SHALL be ≤2 seconds  
**NFR-P-6:** System SHALL support 4+ concurrent 1080p streams  
**NFR-P-7:** Database query time SHALL be ≤100ms  
**NFR-P-8:** System startup time SHALL be ≤30 seconds  

### 4.2 Security Requirements

**NFR-S-1:** System SHALL use bcrypt for password hashing  
**NFR-S-2:** System SHALL use JWT for authentication  
**NFR-S-3:** System SHALL validate all user inputs  
**NFR-S-4:** System SHALL prevent SQL injection attacks  
**NFR-S-5:** System SHALL use HTTPS in production  
**NFR-S-6:** System SHALL secure email credentials storage  
**NFR-S-7:** System SHALL implement CORS restrictions  
**NFR-S-8:** System SHALL log security events  

### 4.3 Reliability Requirements

**NFR-R-1:** System uptime SHALL be ≥99%  
**NFR-R-2:** System SHALL auto-reconnect on camera failure  
**NFR-R-3:** System SHALL degrade gracefully on component failure  
**NFR-R-4:** System SHALL maintain data integrity in database  
**NFR-R-5:** System SHALL guarantee alert delivery (email retry)  
**NFR-R-6:** System SHALL recover after crash  

### 4.4 Availability Requirements

**NFR-A-1:** System SHALL support 24/7 operation  
**NFR-A-2:** System SHALL require no scheduled downtime  
**NFR-A-3:** System SHALL hot-reload configuration changes  
**NFR-A-4:** System SHALL support zero-downtime camera updates  

### 4.5 Maintainability Requirements

**NFR-M-1:** System SHALL have modular code architecture  
**NFR-M-2:** System SHALL provide comprehensive logging  
**NFR-M-3:** System SHALL use environment variables for configuration  
**NFR-M-4:** System SHALL auto-migrate database schema  
**NFR-M-5:** System SHALL provide clear error messages  
**NFR-M-6:** System SHALL support API versioning  

### 4.6 Portability Requirements

**NFR-PO-1:** System SHALL support Windows, Linux, macOS  
**NFR-PO-2:** System SHALL have no platform-specific dependencies  
**NFR-PO-3:** System SHALL support containerization (Docker)  
**NFR-PO-4:** System SHALL use standard protocols only  

### 4.7 Scalability Requirements

**NFR-SC-1:** System SHALL support unlimited cameras (hardware-limited)  
**NFR-SC-2:** System SHALL support horizontal scaling  
**NFR-SC-3:** System SHALL utilize resources efficiently  
**NFR-SC-4:** System SHALL have configurable performance parameters  

### 4.8 Usability Requirements

**NFR-U-1:** System SHALL have intuitive user interface  
**NFR-U-2:** Common tasks SHALL require ≤5 clicks  
**NFR-U-3:** System SHALL provide comprehensive documentation  
**NFR-U-4:** System SHALL provide helpful error messages  
**NFR-U-5:** System SHALL have responsive design  
**NFR-U-6:** System SHALL comply with accessibility standards  

---

## Chapter 5: Hardware and Software Requirements

### 5.1 Hardware Requirements

**Minimum Configuration:**
- Processor: Dual-core CPU, 2.0 GHz
- Memory: 4 GB RAM
- Storage: 10 GB free space
- Network: 100 Mbps Ethernet or WiFi
- Camera: IP camera or USB webcam (640x480 min)

**Recommended Configuration:**
- Processor: Quad-core CPU, 3.0 GHz
- Memory: 8 GB RAM
- Storage: 50 GB SSD
- Network: Gigabit Ethernet
- GPU: NVIDIA GPU with CUDA (optional)
- Camera: 1080p IP cameras with H.264

### 5.2 Software Requirements

**Backend Server:**
- Operating System: Windows 10+, Linux (Ubuntu 20.04+), macOS 10.15+
- Python: 3.8 or higher
- Database: SQLite 3
- Python Libraries: Flask, OpenCV, Ultralytics, PyTorch, etc.

**Frontend (Optional):**
- Node.js: 16.0 or higher
- npm: 8.0 or higher
- Build Tools: Vite 5.4+

**Client Access:**
- Web Browser: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- JavaScript: Enabled
- WebSocket: Support required

### 5.3 Network Requirements

- Local network access to cameras
- Internet for email alerts (SMTP port 587/465)
- Port 5000 for backend API (configurable)
- Port 8080 for frontend (configurable, optional)
- Stable connection with low latency
- Bandwidth: 2-8 Mbps per 1080p camera

### 5.4 Camera Requirements

- Support RTSP, HTTP/MJPEG, or USB connection
- Minimum resolution: 640x480 (VGA)
- Recommended resolution: 1920x1080 (Full HD)
- H.264 or MJPEG video codec
- Network connectivity (for IP cameras)
- Fixed mounting position

---

## Chapter 6: System Features

### 6.1 Autonomous Detection Engine (Priority: High)

**Description:** Core 24/7 detection system operating independently

**Functional Requirements:**
- Auto-start all active cameras on backend launch
- Process frames at configurable rate (default 30 FPS)
- Use YOLOv8 AI for human detection
- Detect persons within defined ROI zones
- Continue detection without frontend connection
- Use per-camera confidence thresholds
- Auto-reconnect on camera failure

**Performance Requirements:**
- Detection latency ≤ 1 second per frame
- Support 4+ concurrent 1080p streams
- CPU usage ≤ 80% under normal operation
- Memory usage ≤ 2GB per camera

### 6.2 Alert Management System (Priority: High)

**Description:** Manages detection alerts and notifications

**Functional Requirements:**
- Send immediate email alerts on detection
- Include captured image with annotations
- Include camera name, timestamp, person count
- Enforce per-camera alert intervals
- Log all detections to database
- Emit WebSocket events for connected clients
- Configurable alert intervals (0-3600 seconds)

**Performance Requirements:**
- Email delivery within 5 seconds
- Graceful handling of email failures
- Image save within 1 second

### 6.3 Camera Management (Priority: High)

**Description:** Camera configuration and lifecycle management

**Functional Requirements:**
- Add cameras via web interface or API
- Remove cameras
- Enable/disable cameras
- Enable/disable detection per camera
- Configure ROI per camera
- Set confidence threshold (0-100%)
- Set alert interval per camera
- Support RTSP, HTTP/MJPEG, USB webcam
- Persist settings in database
- Auto-start streams on camera addition

### 6.4 User Authentication (Priority: High)

**Description:** Secure user access control

**Functional Requirements:**
- User registration with username, email, password
- Bcrypt password hashing
- Username/password authentication
- JWT token issuance
- 24-hour token expiration
- Authentication required for all endpoints (except login/register)
- Users access only their own resources
- SQL injection prevention

### 6.5 Intrusion Logging (Priority: High)

**Description:** Comprehensive event logging

**Functional Requirements:**
- Log every detection to database
- Include camera ID, timestamp, person count, image path
- Save images with unique filenames
- Include bounding boxes and labels in images
- Include timestamp overlay
- Retrieve logs via API
- Configurable retrieval limit (default 50)
- Sort by timestamp (newest first)
- User-specific log access

### 6.6 Live Monitoring Dashboard (Priority: Medium)

**Description:** Optional web-based real-time monitoring

**Functional Requirements:**
- Display cameras in grid layout
- Show live video feeds
- Display camera status indicators
- Show detection status
- Display real-time alerts
- Show recent intrusion logs
- Camera management interface
- ROI configuration interface
- Show detection bounding boxes
- Responsive mobile-friendly design

**Performance Requirements:**
- Video latency ≤ 2 seconds
- Dashboard updates within 1 second of detection
- Graceful disconnection handling

### 6.7 ROI Configuration (Priority: Medium)

**Description:** Define specific monitoring zones

**Functional Requirements:**
- Define rectangular ROI per camera
- Specify x, y, width, height coordinates
- Detect only within ROI
- Monitor entire frame if no ROI set
- Visual ROI indication on live feed
- Adjustable via web interface
- Validate coordinates against frame dimensions

### 6.8 Advanced Detection Settings (Priority: Medium)

**Description:** Per-camera detection customization

**Functional Requirements:**
- Configure confidence threshold (0-100%)
- Higher threshold reduces false positives
- Configure alert interval (seconds)
- Prevent duplicate alerts
- Store settings in database
- Immediate effect without restart
- Use defaults if not configured

---

## Chapter 7: External Interface Requirements

### 7.1 User Interfaces

**UI-1: Login Screen**
- Username and password inputs
- Login and Register buttons
- Error message display
- Responsive design

**UI-2: Main Dashboard**
- Navigation header with user info
- Statistics cards (cameras, alerts)
- Camera grid with live feeds
- Recent intrusion logs
- Add Camera button

**UI-3: Camera Settings Dialog**
- Tabbed interface (General, Detection Zone, Advanced)
- General: name, URL, status
- Detection Zone: ROI selector with preview
- Advanced: confidence slider, alert interval
- Save and Cancel buttons

**UI-4: Intrusion Log Viewer**
- List of recent intrusions
- Camera name, timestamp, person count
- Thumbnail images
- Full-size image viewer

**Design Constraints:**
- Modern Material Design principles
- WCAG 2.1 Level AA accessibility
- Dark and light theme support
- Responsive (mobile, tablet, desktop)
- Visual feedback for all actions

### 7.2 Hardware Interfaces

**Camera Interface:**
- RTSP protocol support
- HTTP/MJPEG support
- USB webcam support (device index)
- H.264 and MJPEG codecs
- Resolutions: 640x480 to 1920x1080

**GPU Interface (Optional):**
- NVIDIA GPU with CUDA support
- CPU fallback if GPU unavailable
- Configurable GPU usage

### 7.3 Software Interfaces

**Database Interface:**
- SQLite 3 database engine
- Tables: users, cameras, intrusion_logs
- File: smartsurveil.db
- Concurrent read support
- Auto-migration on updates

**Email Interface:**
- SMTP protocol
- TLS/SSL encryption
- Gmail, Outlook, custom SMTP support
- Configurable via environment variables
- Graceful failure handling

**AI Model Interface:**
- YOLOv8 from Ultralytics
- Auto-download on first run
- COCO class 0 (person) detection
- Configurable model size (n/s/m/l/x)
- CPU or GPU execution

### 7.4 Communication Interfaces

**HTTP REST API:**
- HTTP/HTTPS protocol
- RESTful design
- JSON request/response
- Appropriate HTTP status codes
- CORS support

**WebSocket Interface:**
- Socket.IO protocol
- Video frame streaming
- Real-time alert broadcasting
- Graceful disconnection handling
- Multiple concurrent clients

**Network Protocols:**
- IPv4 and IPv6 support
- Configurable host and port
- Default ports: 5000 (backend), 8080 (frontend)

---

## Chapter 8: System Models

### 8.1 Use Case Diagram

**Actors:**
- End User
- System Administrator
- Camera (external system)
- Email Server (external system)

**Use Cases:**
- Register/Login
- Add/Remove Camera
- Configure Camera Settings
- View Live Feed
- Receive Alerts
- Review Intrusion Logs
- Configure ROI
- Adjust Detection Settings

### 8.2 Data Flow Diagram

**Level 0 (Context):**
```
[Cameras] → [SmartSurveil System] → [Email Alerts]
[User] ↔ [SmartSurveil System] ↔ [Database]
```

**Level 1:**
```
[Camera Stream] → [Detection Engine] → [Alert Generator]
[Alert Generator] → [Email Service]
[Alert Generator] → [Database Logger]
[User] → [Web Interface] → [API Server]
[API Server] ↔ [Database]
```

### 8.3 State Diagram

**Camera States:**
- Inactive → Active → Streaming → Detecting → Alerting
- Active → Inactive
- Detecting → Detection Disabled
- Connection Lost → Reconnecting → Streaming

**Detection States:**
- Idle → Person Detected → Alert Cooldown → Idle
- Person Detected → Alert Sent → Logged

### 8.4 Entity-Relationship Diagram

**Entities:**
- User (id, username, email, password_hash, created_at)
- Camera (id, user_id, name, url, is_active, detection_enabled, roi_x, roi_y, roi_width, roi_height, confidence_threshold, alert_interval, created_at)
- IntrusionLog (id, camera_id, image_path, detection_count, timestamp)

**Relationships:**
- User 1:N Camera
- Camera 1:N IntrusionLog

### 8.5 Sequence Diagrams

**Detection Sequence:**
1. Camera → Backend: Video Frame
2. Backend → YOLOv8: Process Frame
3. YOLOv8 → Backend: Detection Results
4. Backend → Database: Log Intrusion
5. Backend → Email Server: Send Alert
6. Backend → Frontend: WebSocket Alert

**User Login Sequence:**
1. User → Frontend: Enter Credentials
2. Frontend → Backend: POST /api/login
3. Backend → Database: Verify User
4. Database → Backend: User Data
5. Backend → Frontend: JWT Token
6. Frontend → User: Dashboard Access

---

## Appendix A: API Endpoints

### Authentication
- **POST /api/register** - Register new user
- **POST /api/login** - User login

### Camera Management
- **GET /api/cameras** - List user cameras
- **POST /api/cameras** - Add new camera
- **DELETE /api/cameras/{id}** - Delete camera
- **POST /api/cameras/{id}/toggle** - Toggle active status
- **POST /api/cameras/{id}/detection** - Toggle detection
- **POST /api/cameras/{id}/roi** - Set ROI
- **POST /api/cameras/{id}/advanced** - Update advanced settings

### Logs
- **GET /api/logs** - Retrieve intrusion logs
- **GET /api/alerts/{filename}** - Serve alert image

### WebSocket Events
- **connect** - Client connected
- **disconnect** - Client disconnected
- **start_camera** - Start camera stream
- **camera_frame_{id}** - Video frame data
- **intrusion_detected** - Alert notification

---

## Appendix B: Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cameras (
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
    confidence_threshold REAL DEFAULT 0.5,
    alert_interval INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE intrusion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camera_id INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    detection_count INTEGER DEFAULT 1,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras (id)
);
```

---

**Document End**

*This SRS document is subject to change and will be updated as the project evolves.*
