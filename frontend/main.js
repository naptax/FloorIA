const API_BASE_URL = 'http://localhost:8000';

class ImageAnalyzer {
    constructor() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.analysisData = null;
        this.backgroundOpacity = 0.7;
        
        // Zoom and pan properties
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.minScale = 0.1;
        this.maxScale = 5;
        
        // Original image dimensions
        this.originalWidth = 0;
        this.originalHeight = 0;
        
        // Selected detection
        this.selectedDetectionIndex = -1;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadSection = document.getElementById('uploadSection');
        const opacitySlider = document.getElementById('opacitySlider');
        const resetBtn = document.getElementById('resetBtn');
        
        // Zoom controls
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const fitToWindowBtn = document.getElementById('fitToWindowBtn');
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
        
        // Drag and drop
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('dragover');
        });
        
        uploadSection.addEventListener('dragleave', () => {
            uploadSection.classList.remove('dragover');
        });
        
        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.handleFileUpload(files[0]);
            }
        });
        
        // Opacity slider
        opacitySlider.addEventListener('input', (e) => {
            this.backgroundOpacity = e.target.value / 100;
            document.getElementById('opacityValue').textContent = e.target.value + '%';
            this.redrawCanvas();
        });
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            this.reset();
        });
        
        // Zoom controls
        zoomInBtn.addEventListener('click', () => {
            this.zoomIn();
        });
        
        zoomOutBtn.addEventListener('click', () => {
            this.zoomOut();
        });
        
        fitToWindowBtn.addEventListener('click', () => {
            this.fitToWindow();
        });
        
        // Canvas mouse events for panning
        this.canvas.addEventListener('mousedown', (e) => {
            this.startPan(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.handlePan(e);
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.endPan();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.endPan();
        });
        
        // Mouse wheel for zooming
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleWheel(e);
        });
    }
    
    async handleFileUpload(file) {
        try {
            this.showLoading(true);
            this.hideError();
            
            // Load and display the image
            await this.loadImage(file);
            
            // Send to backend for analysis
            const analysisResult = await this.analyzeImage(file);
            this.analysisData = analysisResult;
            
            // Draw the results
            this.drawAnalysis();
            
            // Show controls and visualization sections
            document.getElementById('controls').style.display = 'flex';
            document.getElementById('visualizationSection').style.display = 'block';
            document.getElementById('dataTableSection').style.display = 'block';
            
            // Populate the data table
            this.populateDataTable();
            
            // Fit image to window initially
            setTimeout(() => this.fitToWindow(), 100);
            
        } catch (error) {
            console.error('Error processing image:', error);
            this.showError('Error processing image: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }
    
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    this.setupCanvas(img.width, img.height);
                    resolve();
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async analyzeImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    setupCanvas(width, height) {
        // Store original image dimensions
        this.originalWidth = width;
        this.originalHeight = height;
        
        // Set canvas to original image size
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Reset zoom and pan
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        
        // Store scale factors for coordinate conversion (1:1 initially)
        this.scaleX = 1;
        this.scaleY = 1;
        
        // Position canvas in container
        this.centerCanvas();
    }
    
    drawAnalysis() {
        if (!this.originalImage || !this.analysisData) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context and apply transformations
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.translateX / this.scale, this.translateY / this.scale);
        
        // Draw background image with opacity
        this.ctx.globalAlpha = this.backgroundOpacity;
        this.ctx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
        
        // Draw bounding boxes
        this.drawBoundingBoxes();
        
        // Restore context
        this.ctx.restore();
    }
    
    drawBoundingBoxes() {
        if (!this.analysisData.detections) return;
        
        this.analysisData.detections.forEach((detection, index) => {
            const { bbox, label, confidence } = detection;
            const isSelected = index === this.selectedDetectionIndex;
            
            // Set colors based on selection
            if (isSelected) {
                this.ctx.strokeStyle = '#667eea';
                this.ctx.lineWidth = 4;
                this.ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
            } else {
                this.ctx.strokeStyle = '#ff0000';
                this.ctx.lineWidth = 2;
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            }
            
            this.ctx.font = '14px Arial';
            
            // Use original coordinates (no scaling needed as we're in transformed context)
            const x = bbox.x;
            const y = bbox.y;
            const width = bbox.width;
            const height = bbox.height;
            
            // Draw bounding box
            this.ctx.strokeRect(x, y, width, height);
            this.ctx.fillRect(x, y, width, height);
            
            // Draw label with confidence
            const text = `${label} (${(confidence * 100).toFixed(1)}%)`;
            const textMetrics = this.ctx.measureText(text);
            const textHeight = 18;
            
            // Background for text
            this.ctx.fillStyle = isSelected ? 'rgba(102, 126, 234, 0.9)' : 'rgba(255, 0, 0, 0.8)';
            this.ctx.fillRect(x, y - textHeight, textMetrics.width + 10, textHeight);
            
            // Text
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(text, x + 5, y - 5);
        });
    }
    
    redrawCanvas() {
        this.drawAnalysis();
    }
    
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }
    
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }
    
    reset() {
        this.originalImage = null;
        this.analysisData = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        document.getElementById('controls').style.display = 'none';
        document.getElementById('visualizationSection').style.display = 'none';
        document.getElementById('dataTableSection').style.display = 'none';
        document.getElementById('fileInput').value = '';
        document.getElementById('opacitySlider').value = 70;
        document.getElementById('opacityValue').textContent = '70%';
        this.backgroundOpacity = 0.7;
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.selectedDetectionIndex = -1;
        this.hideError();
    }
    
    // Zoom and Pan Methods
    zoomIn() {
        const newScale = Math.min(this.scale * 1.2, this.maxScale);
        this.setZoom(newScale);
    }
    
    zoomOut() {
        const newScale = Math.max(this.scale / 1.2, this.minScale);
        this.setZoom(newScale);
    }
    
    setZoom(newScale) {
        this.scale = newScale;
        this.redrawCanvas();
    }
    
    fitToWindow() {
        if (!this.originalImage) return;
        
        const container = document.getElementById('canvasContainer');
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40;
        
        const scaleX = containerWidth / this.originalWidth;
        const scaleY = containerHeight / this.originalHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size
        
        this.scale = scale;
        this.translateX = 0;
        this.translateY = 0;
        this.centerCanvas();
        this.redrawCanvas();
    }
    
    centerCanvas() {
        const container = document.getElementById('canvasContainer');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scaledWidth = this.canvas.width * this.scale;
        const scaledHeight = this.canvas.height * this.scale;
        
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = Math.max(0, (containerWidth - scaledWidth) / 2) + 'px';
        this.canvas.style.top = Math.max(0, (containerHeight - scaledHeight) / 2) + 'px';
        this.canvas.style.transform = `scale(${this.scale})`;
        this.canvas.style.transformOrigin = 'top left';
    }
    
    startPan(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
    }
    
    handlePan(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.translateX += deltaX;
        this.translateY += deltaY;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        this.redrawCanvas();
    }
    
    endPan() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }
    
    handleWheel(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * 0.1);
        const newScale = Math.min(Math.max(this.scale * zoom, this.minScale), this.maxScale);
        
        if (newScale !== this.scale) {
            // Zoom towards mouse position
            const scaleChange = newScale / this.scale;
            this.translateX = mouseX - scaleChange * (mouseX - this.translateX);
            this.translateY = mouseY - scaleChange * (mouseY - this.translateY);
            this.scale = newScale;
            this.redrawCanvas();
        }
    }
    
    // Data Table Methods
    populateDataTable() {
        if (!this.analysisData || !this.analysisData.detections) return;
        
        const tbody = document.getElementById('detectionTableBody');
        tbody.innerHTML = '';
        
        this.analysisData.detections.forEach((detection, index) => {
            const row = document.createElement('tr');
            row.dataset.index = index;
            
            // Add click event for row selection
            row.addEventListener('click', () => {
                this.selectDetection(index);
            });
            
            const { bbox, label, confidence, geometry } = detection;
            
            row.innerHTML = `
                <td><strong>${index + 1}</strong></td>
                <td><span class="label-badge">${label}</span></td>
                <td>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence * 100}%"></div>
                    </div>
                    <small>${(confidence * 100).toFixed(1)}%</small>
                </td>
                <td>${Math.round(bbox.x)}, ${Math.round(bbox.y)}</td>
                <td>${Math.round(bbox.width)} × ${Math.round(bbox.height)}</td>
                <td>${geometry ? Math.round(geometry.area) : 'N/A'}</td>
                <td>${geometry ? Math.round(geometry.perimeter) : 'N/A'}</td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    selectDetection(index) {
        // Remove previous selection
        const previousSelected = document.querySelector('.detection-table tr.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add new selection
        const newSelected = document.querySelector(`[data-index="${index}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
        }
        
        this.selectedDetectionIndex = index;
        this.redrawCanvas();
        
        // Optionally zoom to the selected detection
        this.zoomToDetection(index);
    }
    
    zoomToDetection(index) {
        if (!this.analysisData || !this.analysisData.detections[index]) return;
        
        const detection = this.analysisData.detections[index];
        const { bbox } = detection;
        
        // Calculate zoom level to fit the detection with some padding
        const container = document.getElementById('canvasContainer');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const padding = 100; // Padding around the detection
        const scaleX = (containerWidth - padding) / bbox.width;
        const scaleY = (containerHeight - padding) / bbox.height;
        const targetScale = Math.min(scaleX, scaleY, this.maxScale);
        
        // Center on the detection
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        
        this.scale = targetScale;
        this.translateX = containerWidth / 2 - centerX * targetScale;
        this.translateY = containerHeight / 2 - centerY * targetScale;
        
        this.centerCanvas();
        this.redrawCanvas();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ImageAnalyzer();
});
