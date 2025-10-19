const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

let socket;
let cameras = [];
let logs = [];
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    connectWebSocket();
});

async function initializeDashboard() {
    document.getElementById('username').textContent = user.username || 'User';
    await loadCameras();
    await loadLogs();
    updateStats();
}

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    document.getElementById('addCameraBtn').addEventListener('click', () => {
        showModal('addCameraModal');
    });

    document.getElementById('addCameraForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddCamera();
    });

    document.querySelectorAll('.close, .close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

function connectWebSocket() {
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('WebSocket connected');

        cameras.forEach(camera => {
            socket.emit('start_camera', { camera_id: camera.id });

            socket.on(`camera_frame_${camera.id}`, (data) => {
                updateCameraFrame(camera.id, data.frame);
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });

    socket.on('intrusion_detected', (data) => {
        handleIntrusionAlert(data);
    });
}

async function loadCameras() {
    try {
        const response = await fetch(`${API_URL}/cameras`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            cameras = data.cameras;
            renderCameras();
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading cameras:', error);
        showToast('Error loading cameras', 'error');
    }
}

function renderCameras() {
    const grid = document.getElementById('cameraGrid');

    if (cameras.length === 0) {
        grid.innerHTML = '<p style="color: #9ca3af;">No cameras added yet. Click "Add Camera" to get started.</p>';
        return;
    }

    grid.innerHTML = cameras.map(camera => `
        <div class="camera-card" id="camera-${camera.id}">
            <div class="camera-header">
                <h3>${camera.name}</h3>
                <button class="btn btn-sm" onclick="showROIModal(${camera.id})">⚙️</button>
            </div>
            <div class="camera-feed">
                <img id="feed-${camera.id}" alt="${camera.name}" style="display:none;" />
                <div class="no-signal" id="no-signal-${camera.id}">Connecting...</div>
            </div>
            <div class="camera-controls">
                <button class="btn btn-sm ${camera.detection_enabled ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleDetection(${camera.id}, ${!camera.detection_enabled})">
                    ${camera.detection_enabled ? '⏸️ Pause' : '▶️ Resume'}
                </button>
            </div>
        </div>
    `).join('');
}

function updateCameraFrame(cameraId, frameData) {
    const img = document.getElementById(`feed-${cameraId}`);
    const noSignal = document.getElementById(`no-signal-${cameraId}`);

    if (img && frameData) {
        img.src = `data:image/jpeg;base64,${frameData}`;
        img.style.display = 'block';
        if (noSignal) noSignal.style.display = 'none';
    }
}

async function handleAddCamera() {
    const name = document.getElementById('cameraName').value;
    const url = document.getElementById('cameraUrl').value;

    try {
        const response = await fetch(`${API_URL}/cameras`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, url })
        });

        if (response.ok) {
            showToast('Camera added successfully', 'success');
            hideModal('addCameraModal');
            document.getElementById('addCameraForm').reset();
            await loadCameras();
            connectWebSocket();
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to add camera', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    }
}

async function toggleDetection(cameraId, enabled) {
    try {
        const response = await fetch(`${API_URL}/cameras/${cameraId}/detection`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ enabled })
        });

        if (response.ok) {
            showToast(`Detection ${enabled ? 'enabled' : 'paused'}`, 'success');
            await loadCameras();
        }
    } catch (error) {
        showToast('Error toggling detection', 'error');
    }
}

async function loadLogs() {
    try {
        const response = await fetch(`${API_URL}/logs?limit=20`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            logs = data.logs;
            renderLogs();
        }
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

function renderLogs() {
    const logsList = document.getElementById('logsList');

    if (logs.length === 0) {
        logsList.innerHTML = '<p style="color: #9ca3af; font-size: 14px;">No intrusions detected</p>';
        return;
    }

    logsList.innerHTML = logs.map(log => `
        <div class="log-item">
            <div class="log-item-header">
                <span class="log-item-camera">${log.camera_name}</span>
                <span class="log-item-time">${formatTime(log.timestamp)}</span>
            </div>
            <div class="log-item-content">
                ${log.detection_count} person(s) detected
            </div>
        </div>
    `).join('');
}

function handleIntrusionAlert(data) {
    showToast(`🚨 Intrusion detected at ${data.camera_name}!`, 'error');
    loadLogs();
    updateStats();
}

function updateStats() {
    document.getElementById('totalCameras').textContent = cameras.length;
    document.getElementById('activeCameras').textContent = cameras.filter(c => c.is_active).length;
    document.getElementById('totalAlerts').textContent = logs.length;
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

window.toggleDetection = toggleDetection;
window.showROIModal = showROIModal;

function showROIModal(cameraId) {
    showToast('ROI configuration: Enter coordinates manually', 'info');
    showModal('roiModal');
    document.getElementById('roiForm').dataset.cameraId = cameraId;
}
