// Interactive ROI Selector Class
class ROISelector {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentCameraId = null;
        this.currentFrame = null;
        
        // ROI rectangle
        this.roi = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        
        // Drawing state
        this.isDrawing = false;
        this.isDragging = false;
        this.dragHandle = null;
        this.startX = 0;
        this.startY = 0;
        
        // Handle size for corners
        this.handleSize = 12;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }
    
    loadImage(imageSrc) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Set canvas size to match image
                this.canvas.width = 800;
                this.canvas.height = (img.height / img.width) * 800;
                
                // Store image
                this.currentFrame = img;
                this.scaleX = img.width / this.canvas.width;
                this.scaleY = img.height / this.canvas.height;
                
                this.draw();
                resolve();
            };
            img.onerror = reject;
            img.src = imageSrc;
        });
    }
    
    setROI(x, y, width, height) {
        // Convert from actual coordinates to canvas coordinates
        this.roi = {
            x: x / this.scaleX,
            y: y / this.scaleY,
            width: width / this.scaleX,
            height: height / this.scaleY
        };
        this.draw();
    }
    
    getROI() {
        // Convert from canvas coordinates to actual coordinates
        return {
            x: Math.round(this.roi.x * this.scaleX),
            y: Math.round(this.roi.y * this.scaleY),
            width: Math.round(this.roi.width * this.scaleX),
            height: Math.round(this.roi.height * this.scaleY)
        };
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on a handle
        const handle = this.getHandleAtPoint(x, y);
        
        if (handle) {
            this.isDragging = true;
            this.dragHandle = handle;
            this.startX = x;
            this.startY = y;
        } else if (this.isInsideROI(x, y)) {
            // Start dragging the entire ROI
            this.isDragging = true;
            this.dragHandle = 'move';
            this.startX = x;
            this.startY = y;
        } else {
            // Start drawing new ROI
            this.isDrawing = true;
            this.roi.x = x;
            this.roi.y = y;
            this.roi.width = 0;
            this.roi.height = 0;
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update cursor
        this.updateCursor(x, y);
        
        if (this.isDrawing) {
            // Drawing new ROI
            this.roi.width = x - this.roi.x;
            this.roi.height = y - this.roi.y;
            this.draw();
            this.updateROIInfo();
        } else if (this.isDragging) {
            const dx = x - this.startX;
            const dy = y - this.startY;
            
            if (this.dragHandle === 'move') {
                // Move entire ROI
                this.roi.x += dx;
                this.roi.y += dy;
            } else {
                // Resize ROI based on handle
                this.resizeROI(dx, dy);
            }
            
            this.startX = x;
            this.startY = y;
            this.draw();
            this.updateROIInfo();
        }
    }
    
    handleMouseUp(e) {
        if (this.isDrawing && (Math.abs(this.roi.width) > 10 || Math.abs(this.roi.height) > 10)) {
            // Normalize negative dimensions
            if (this.roi.width < 0) {
                this.roi.x += this.roi.width;
                this.roi.width = Math.abs(this.roi.width);
            }
            if (this.roi.height < 0) {
                this.roi.y += this.roi.height;
                this.roi.height = Math.abs(this.roi.height);
            }
        }
        
        this.isDrawing = false;
        this.isDragging = false;
        this.dragHandle = null;
    }
    
    resizeROI(dx, dy) {
        switch (this.dragHandle) {
            case 'tl': // Top-left
                this.roi.x += dx;
                this.roi.y += dy;
                this.roi.width -= dx;
                this.roi.height -= dy;
                break;
            case 'tr': // Top-right
                this.roi.y += dy;
                this.roi.width += dx;
                this.roi.height -= dy;
                break;
            case 'bl': // Bottom-left
                this.roi.x += dx;
                this.roi.width -= dx;
                this.roi.height += dy;
                break;
            case 'br': // Bottom-right
                this.roi.width += dx;
                this.roi.height += dy;
                break;
        }
    }
    
    getHandleAtPoint(x, y) {
        const handles = this.getHandles();
        const threshold = this.handleSize;
        
        for (let [name, pos] of Object.entries(handles)) {
            if (Math.abs(x - pos.x) < threshold && Math.abs(y - pos.y) < threshold) {
                return name;
            }
        }
        
        return null;
    }
    
    getHandles() {
        return {
            'tl': { x: this.roi.x, y: this.roi.y },
            'tr': { x: this.roi.x + this.roi.width, y: this.roi.y },
            'bl': { x: this.roi.x, y: this.roi.y + this.roi.height },
            'br': { x: this.roi.x + this.roi.width, y: this.roi.y + this.roi.height }
        };
    }
    
    isInsideROI(x, y) {
        return x >= this.roi.x && 
               x <= this.roi.x + this.roi.width &&
               y >= this.roi.y && 
               y <= this.roi.y + this.roi.height;
    }
    
    updateCursor(x, y) {
        const handle = this.getHandleAtPoint(x, y);
        
        if (handle) {
            if (handle === 'tl' || handle === 'br') {
                this.canvas.style.cursor = 'nwse-resize';
            } else {
                this.canvas.style.cursor = 'nesw-resize';
            }
        } else if (this.isInsideROI(x, y)) {
            this.canvas.style.cursor = 'move';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw image
        if (this.currentFrame) {
            this.ctx.drawImage(this.currentFrame, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw semi-transparent overlay outside ROI
        if (this.roi.width > 0 && this.roi.height > 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            
            // Top
            this.ctx.fillRect(0, 0, this.canvas.width, this.roi.y);
            // Bottom
            this.ctx.fillRect(0, this.roi.y + this.roi.height, 
                            this.canvas.width, this.canvas.height - (this.roi.y + this.roi.height));
            // Left
            this.ctx.fillRect(0, this.roi.y, this.roi.x, this.roi.height);
            // Right
            this.ctx.fillRect(this.roi.x + this.roi.width, this.roi.y, 
                            this.canvas.width - (this.roi.x + this.roi.width), this.roi.height);
        }
        
        // Draw ROI rectangle
        if (this.roi.width > 0 && this.roi.height > 0) {
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.roi.x, this.roi.y, this.roi.width, this.roi.height);
            
            // Draw handles
            this.drawHandles();
            
            // Draw dimensions
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.font = '14px Arial';
            const text = `${Math.round(this.roi.width * this.scaleX)} × ${Math.round(this.roi.height * this.scaleY)}`;
            const textWidth = this.ctx.measureText(text).width;
            
            // Background for text
            this.ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
            this.ctx.fillRect(this.roi.x + this.roi.width / 2 - textWidth / 2 - 8, 
                            this.roi.y - 25, textWidth + 16, 20);
            
            // Text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(text, this.roi.x + this.roi.width / 2 - textWidth / 2, this.roi.y - 10);
        }
    }
    
    drawHandles() {
        const handles = this.getHandles();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        
        for (let pos of Object.values(handles)) {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.handleSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    updateROIInfo() {
        const actual = this.getROI();
        const info = document.getElementById('roiDimensions');
        if (info) {
            info.textContent = `Selection: ${actual.x}, ${actual.y} | Size: ${actual.width} × ${actual.height}`;
        }
    }
    
    reset() {
        this.roi = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        };
        this.draw();
        this.updateROIInfo();
    }
    
    setFullFrame() {
        this.roi = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        };
        this.draw();
        this.updateROIInfo();
    }
}

// Initialize ROI Selector when modal opens
let roiSelector = null;

window.initializeROISelector = function() {
    if (!roiSelector) {
        roiSelector = new ROISelector('roiCanvas');
    }
};

// Export for use in other scripts
window.ROISelector = ROISelector;
window.roiSelector = roiSelector;
