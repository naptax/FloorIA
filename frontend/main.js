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
        
        // Sorting properties
        this.sortColumn = null;
        this.sortDirection = 'asc'; // 'asc' or 'desc'
        this.originalDetections = null;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const opacitySlider = document.getElementById('opacitySlider');
        const resetBtn = document.getElementById('resetBtn');
        
        // Zoom controls
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const fitBtn = document.getElementById('fitBtn');
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
        
        // Drag and drop on canvas container
        const canvasContainer = document.getElementById('canvasContainer');
        if (canvasContainer) {
            canvasContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                canvasContainer.style.background = '#333337';
            });
            
            canvasContainer.addEventListener('dragleave', () => {
                canvasContainer.style.background = '#1e1e1e';
            });
            
            canvasContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                canvasContainer.style.background = '#1e1e1e';
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    this.handleFileUpload(files[0]);
                }
            });
        }
        
        // Opacity slider
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                this.backgroundOpacity = e.target.value / 100;
                const opacityValue = document.getElementById('opacityValue');
                if (opacityValue) {
                    opacityValue.textContent = e.target.value + '%';
                }
                this.redrawCanvas();
            });
        }
        
        // Reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }
        
        // Zoom controls
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoomIn();
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoomOut();
            });
        }
        
        if (fitBtn) {
            fitBtn.addEventListener('click', () => {
                this.fitToWindow();
            });
        }
        
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
        
        // Table header sorting
        this.initializeTableSorting();
    }
    
    initializeTableSorting() {
        // Initialize sort controls
        const sortSelect = document.getElementById('sortSelect');
        const sortDirectionBtn = document.getElementById('sortDirection');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortTable(e.target.value);
            });
        }
        
        if (sortDirectionBtn) {
            sortDirectionBtn.addEventListener('click', () => {
                // Toggle direction and re-sort
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                this.updateSortIndicators();
                
                if (this.sortColumn) {
                    const sortedDetections = this.getSortedDetections(this.sortColumn, this.sortDirection);
                    this.analysisData.detections = sortedDetections;
                    this.populateDataTable();
                }
            });
        }
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
            
            // Store original detections for sorting
            this.originalDetections = analysisResult.detections.slice();
            
            // Draw the results
            this.drawAnalysis();
            
            // Show visualization section
            const visualizationSection = document.getElementById('visualizationSection');
            if (visualizationSection) {
                visualizationSection.style.display = 'block';
            }
            
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
    
    sortTable(sortKey) {
        if (!this.analysisData || !this.analysisData.detections) return;
        
        // Toggle sort direction if clicking the same column
        if (this.sortColumn === sortKey) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = sortKey;
            this.sortDirection = 'asc';
        }
        
        // Update header visual indicators
        this.updateSortIndicators();
        
        // Sort the detections
        const sortedDetections = this.getSortedDetections(sortKey, this.sortDirection);
        
        // Update the analysis data with sorted detections
        this.analysisData.detections = sortedDetections;
        
        // Repopulate the table
        this.populateDataTable();
    }
    
    updateSortIndicators() {
        // Update sort direction button
        const sortDirectionBtn = document.getElementById('sortDirection');
        if (sortDirectionBtn) {
            sortDirectionBtn.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
            sortDirectionBtn.classList.toggle('desc', this.sortDirection === 'desc');
        }
        
        // Update sort select to current column
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect && this.sortColumn) {
            sortSelect.value = this.sortColumn;
        }
    }
    
    getSortedDetections(sortKey, direction) {
        const detections = this.originalDetections.slice(); // Work with original data
        
        return detections.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortKey) {
                case 'index':
                    valueA = this.originalDetections.indexOf(a);
                    valueB = this.originalDetections.indexOf(b);
                    break;
                case 'label':
                    valueA = a.label.toLowerCase();
                    valueB = b.label.toLowerCase();
                    break;
                case 'confidence':
                    valueA = a.confidence;
                    valueB = b.confidence;
                    break;
                case 'position':
                    valueA = a.bbox.x + a.bbox.y; // Sort by combined position
                    valueB = b.bbox.x + b.bbox.y;
                    break;
                case 'dimensions':
                    valueA = a.bbox.width * a.bbox.height; // Sort by area
                    valueB = b.bbox.width * b.bbox.height;
                    break;
                case 'area':
                    valueA = a.geometry ? a.geometry.area : 0;
                    valueB = b.geometry ? b.geometry.area : 0;
                    break;
                case 'perimeter':
                    valueA = a.geometry ? a.geometry.perimeter : 0;
                    valueB = b.geometry ? b.geometry.perimeter : 0;
                    break;
                default:
                    return 0;
            }
            
            // Handle string vs number comparison
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                const comparison = valueA.localeCompare(valueB);
                return direction === 'asc' ? comparison : -comparison;
            } else {
                const comparison = valueA - valueB;
                return direction === 'asc' ? comparison : -comparison;
            }
        });
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
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }
    
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    reset() {
        this.originalImage = null;
        this.analysisData = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Hide visualization section if it exists
        const visualizationSection = document.getElementById('visualizationSection');
        if (visualizationSection) {
            visualizationSection.style.display = 'none';
        }
        
        // Clear detection list
        const detectionList = document.getElementById('detectionList');
        if (detectionList) {
            detectionList.innerHTML = '';
        }
        
        // Reset form elements
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }
        
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider) {
            opacitySlider.value = 70;
        }
        if (opacityValue) {
            opacityValue.textContent = '70%';
        }
        
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
    
    // Data Cards Methods
    populateDataTable() {
        if (!this.analysisData || !this.analysisData.detections) return;
        
        const container = document.getElementById('detectionList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.analysisData.detections.forEach((detection, index) => {
            const card = this.createDetectionCard(detection, index);
            container.appendChild(card);
        });
    }
    
    createDetectionCard(detection, index) {
        const { bbox, label, confidence, geometry } = detection;
        
        const card = document.createElement('div');
        card.className = 'detection-card';
        card.dataset.index = index;
        
        // Add click event for card selection
        card.addEventListener('click', () => {
            this.selectDetection(index);
        });
        
        card.innerHTML = `
            <div class="detection-card-header">
                <div class="detection-index">${index + 1}</div>
                <div class="detection-label">${label}</div>
            </div>
            
            <div class="detection-confidence">
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidence * 100}%"></div>
                </div>
                <div class="confidence-text">${(confidence * 100).toFixed(1)}%</div>
            </div>
            
            <div class="detection-details">
                <div class="detail-item">
                    <div class="detail-label">Position</div>
                    <div class="detail-value">${Math.round(bbox.x)}, ${Math.round(bbox.y)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Dimensions</div>
                    <div class="detail-value">${Math.round(bbox.width)}×${Math.round(bbox.height)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Surface</div>
                    <div class="detail-value">${geometry ? Math.round(geometry.area) : 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Périmètre</div>
                    <div class="detail-value">${geometry ? Math.round(geometry.perimeter) : 'N/A'}</div>
                </div>
            </div>
        `;
        
        return card;
    }
    
    selectDetection(index) {
        // Remove previous selection
        const previousSelected = document.querySelector('.detection-card.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add new selection
        const newSelected = document.querySelector(`.detection-card[data-index="${index}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
            // Scroll the card into view
            newSelected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        this.selectedDetectionIndex = index;
        
        // Trigger highlight animation instead of zoom
        this.highlightDetection(index);
        
        this.redrawCanvas();
    }
    
    highlightDetection(index) {
        if (!this.analysisData || !this.analysisData.detections[index]) return;
        
        const detection = this.analysisData.detections[index];
        const { bbox } = detection;
        
        // Create a temporary highlight overlay
        const highlightCanvas = document.createElement('canvas');
        highlightCanvas.width = this.canvas.width;
        highlightCanvas.height = this.canvas.height;
        highlightCanvas.style.position = 'absolute';
        highlightCanvas.style.top = this.canvas.style.top || '0px';
        highlightCanvas.style.left = this.canvas.style.left || '0px';
        highlightCanvas.style.transform = this.canvas.style.transform || 'scale(1)';
        highlightCanvas.style.transformOrigin = this.canvas.style.transformOrigin || 'top left';
        highlightCanvas.style.pointerEvents = 'none';
        highlightCanvas.style.zIndex = '10';
        
        const container = document.getElementById('canvasContainer');
        if (container) {
            container.appendChild(highlightCanvas);
        } else {
            return; // Exit if container doesn't exist
        }
        
        const highlightCtx = highlightCanvas.getContext('2d');
        
        // Animation variables
        let opacity = 0.6;
        let pulseDirection = -1;
        let animationFrame = 0;
        const maxFrames = 60; // 1 second at 60fps
        
        const animate = () => {
            highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
            
            // Apply same transformations as main canvas
            highlightCtx.save();
            highlightCtx.scale(this.scale, this.scale);
            highlightCtx.translate(this.translateX / this.scale, this.translateY / this.scale);
            
            // Draw pulsing highlight
            highlightCtx.fillStyle = `rgba(102, 126, 234, ${opacity})`;
            highlightCtx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);
            
            // Draw animated border
            highlightCtx.strokeStyle = `rgba(102, 126, 234, ${opacity + 0.3})`;
            highlightCtx.lineWidth = 6;
            highlightCtx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            
            highlightCtx.restore();
            
            // Update opacity for pulsing effect
            opacity += pulseDirection * 0.02;
            if (opacity <= 0.2) {
                opacity = 0.2;
                pulseDirection = 1;
            } else if (opacity >= 0.6) {
                opacity = 0.6;
                pulseDirection = -1;
            }
            
            animationFrame++;
            
            if (animationFrame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                // Remove highlight overlay after animation
                if (container && container.contains(highlightCanvas)) {
                    container.removeChild(highlightCanvas);
                }
            }
        };
        
        animate();
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
