// Global ROI selector instance
let roiSelector = null;
let currentROICameraId = null;

// Initialize ROI selector when needed
function initROISelector() {
    if (!roiSelector) {
        roiSelector = new ROISelector('roiCanvas');
    }
}

// Show ROI Modal with current camera frame
async function showROIModal(cameraId) {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;
    
    currentROICameraId = cameraId;
    
    // Initialize selector
    initROISelector();
    
    // Show loading
    showLoading();
    
    try {
        // Get current frame from camera
        const frameImg = document.getElementById(`feed-${cameraId}`);
        
        if (frameImg && frameImg.src && frameImg.src.startsWith('data:image')) {
            // Load current frame into canvas
            await roiSelector.loadImage(frameImg.src);
            
            // Set existing ROI
            roiSelector.setROI(
                camera.roi_x || 0,
                camera.roi_y || 0,
                camera.roi_width || 640,
                camera.roi_height || 480
            );
            
            hideLoading();
            showModal('roiModal');
        } else {
            hideLoading();
            showToast('No camera feed available. Start camera first.', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Failed to load camera frame', 'error');
        console.error(error);
    }
}

// Save ROI
document.getElementById('saveROI')?.addEventListener('click', async () => {
    if (!roiSelector || !currentROICameraId) return;
    
    const roi = roiSelector.getROI();
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/cameras/${currentROICameraId}/roi`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roi)
        });
        
        if (response.ok) {
            hideLoading();
            showToast('Detection zone updated successfully!', 'success');
            hideModal('roiModal');
            await loadCameras();
        } else {
            hideLoading();
            const data = await response.json();
            showToast(data.error || 'Failed to update ROI', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Network error', 'error');
    }
});

// Reset ROI button
document.getElementById('resetROI')?.addEventListener('click', () => {
    if (roiSelector) {
        const camera = cameras.find(c => c.id === currentROICameraId);
        if (camera) {
            roiSelector.setROI(
                camera.roi_x || 0,
                camera.roi_y || 0,
                camera.roi_width || 640,
                camera.roi_height || 480
            );
        }
    }
});

// Full frame ROI button
document.getElementById('fullFrameROI')?.addEventListener('click', () => {
    if (roiSelector) {
        roiSelector.setFullFrame();
    }
});

// Enhanced camera card rendering with new UI
function renderEnhancedCameraCard(camera) {
    const statusClass = camera.is_active ? 'active' : 'inactive';
    const detectionStatus = camera.detection_enabled ? 'Detecting' : 'Paused';
    
    return `
        <div class="camera-card" id="camera-${camera.id}" data-camera-id="${camera.id}">
            <div class="camera-header">
                <div>
                    <h3>${camera.name}</h3>
                    <div class="camera-status-indicator">
                        <span class="status-dot ${statusClass}"></span>
                        <span>${detectionStatus}</span>
                    </div>
                </div>
                <div class="camera-actions">
                    <button class="btn-icon" onclick="showROIModal(${camera.id})" title="Configure ROI">
                        ⚙️
                    </button>
                    <button class="btn-icon" onclick="toggleCameraMenu(${camera.id})" title="More options">
                        ⋮
                    </button>
                </div>
            </div>
            
            <div class="camera-feed" id="feed-container-${camera.id}">
                <img id="feed-${camera.id}" alt="${camera.name}" style="display:none;" />
                <div class="no-signal" id="no-signal-${camera.id}">
                    <div class="signal-text">Connecting to camera...</div>
                    <div class="loading-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
            
            <div class="camera-info">
                <div class="info-item">
                    <span class="info-label">Resolution:</span>
                    <span class="info-value" id="resolution-${camera.id}">-</span>
                </div>
                <div class="info-item">
                    <span class="info-label">FPS:</span>
                    <span class="info-value" id="fps-${camera.id}">-</span>
                </div>
                <div class="info-item">
                    <span class="info-label">ROI:</span>
                    <span class="info-value">${camera.roi_width}×${camera.roi_height}</span>
                </div>
            </div>
            
            <div class="camera-controls">
                <button class="btn btn-sm ${camera.detection_enabled ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleDetection(${camera.id}, ${!camera.detection_enabled})">
                    <span>${camera.detection_enabled ? '⏸' : '▶'}</span>
                    ${camera.detection_enabled ? 'Pause' : 'Resume'}
                </button>
                <button class="btn btn-sm btn-primary" onclick="showROIModal(${camera.id})">
                    <span>🎯</span> Set Zone
                </button>
            </div>
        </div>
    `;
}

// Enhanced toast notifications
function showToast(message, type = 'info', title = '') {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Set icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toastIcon.textContent = icons[type] || icons.info;
    
    // Set title
    if (!title) {
        title = type.charAt(0).toUpperCase() + type.slice(1);
    }
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    toast.className = `toast show ${type}`;
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Close toast manually
document.querySelector('.toast-close')?.addEventListener('click', () => {
    document.getElementById('toast').classList.remove('show');
});

// Loading overlay helpers
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Enhanced modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            const modal = overlay.closest('.modal');
            if (modal) hideModal(modal.id);
        }
    });
});

// Close modals on close button click
document.querySelectorAll('.close-btn, .close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) hideModal(modal.id);
    });
});

// Export functions globally
window.showROIModal = showROIModal;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showModal = showModal;
window.hideModal = hideModal;
