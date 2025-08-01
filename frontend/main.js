const API_BASE_URL = 'http://localhost:8000';

class ImageAnalyzer {
    constructor() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.analysisData = null;
        this.backgroundOpacity = 0.7;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadSection = document.getElementById('uploadSection');
        const opacitySlider = document.getElementById('opacitySlider');
        const resetBtn = document.getElementById('resetBtn');
        
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
            
            // Show controls
            document.getElementById('controls').style.display = 'flex';
            
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
        // Scale canvas to fit container while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        
        let canvasWidth = width;
        let canvasHeight = height;
        
        if (width > maxWidth) {
            canvasWidth = maxWidth;
            canvasHeight = (height * maxWidth) / width;
        }
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = (width * maxHeight) / height;
        }
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // Store scale factors for coordinate conversion
        this.scaleX = canvasWidth / width;
        this.scaleY = canvasHeight / height;
    }
    
    drawAnalysis() {
        if (!this.originalImage || !this.analysisData) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background image with opacity
        this.ctx.globalAlpha = this.backgroundOpacity;
        this.ctx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
        
        // Draw bounding boxes
        this.drawBoundingBoxes();
    }
    
    drawBoundingBoxes() {
        if (!this.analysisData.detections) return;
        
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.font = '16px Arial';
        
        this.analysisData.detections.forEach((detection, index) => {
            const { bbox, label, confidence } = detection;
            
            // Convert coordinates to canvas scale
            const x = bbox.x * this.scaleX;
            const y = bbox.y * this.scaleY;
            const width = bbox.width * this.scaleX;
            const height = bbox.height * this.scaleY;
            
            // Draw bounding box
            this.ctx.strokeRect(x, y, width, height);
            this.ctx.fillRect(x, y, width, height);
            
            // Draw label with confidence
            const text = `${label} (${(confidence * 100).toFixed(1)}%)`;
            const textMetrics = this.ctx.measureText(text);
            const textHeight = 20;
            
            // Background for text
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            this.ctx.fillRect(x, y - textHeight, textMetrics.width + 10, textHeight);
            
            // Text
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(text, x + 5, y - 5);
            
            // Reset fill style for next iteration
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
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
        document.getElementById('fileInput').value = '';
        document.getElementById('opacitySlider').value = 70;
        document.getElementById('opacityValue').textContent = '70%';
        this.backgroundOpacity = 0.7;
        this.hideError();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ImageAnalyzer();
});
