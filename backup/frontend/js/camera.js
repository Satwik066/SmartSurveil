function showROIModal(cameraId) {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;

    document.getElementById('roiX').value = camera.roi_x || 0;
    document.getElementById('roiY').value = camera.roi_y || 0;
    document.getElementById('roiWidth').value = camera.roi_width || 640;
    document.getElementById('roiHeight').value = camera.roi_height || 480;

    showModal('roiModal');
    document.getElementById('roiForm').dataset.cameraId = cameraId;
}

if (document.getElementById('roiForm')) {
    document.getElementById('roiForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const cameraId = e.target.dataset.cameraId;
        const x = parseInt(document.getElementById('roiX').value);
        const y = parseInt(document.getElementById('roiY').value);
        const width = parseInt(document.getElementById('roiWidth').value);
        const height = parseInt(document.getElementById('roiHeight').value);

        try {
            const response = await fetch(`${API_URL}/cameras/${cameraId}/roi`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ x, y, width, height })
            });

            if (response.ok) {
                showToast('ROI updated successfully', 'success');
                hideModal('roiModal');
                await loadCameras();
            } else {
                showToast('Failed to update ROI', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        }
    });
}
