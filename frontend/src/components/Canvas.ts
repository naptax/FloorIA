// FloorIA Canvas Component

import type { AnalysisResult, CanvasTransform, ComponentEventHandlers } from '@/types';
import { CanvasUtils } from '@/utils/canvas';

export class Canvas {
  private element: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private eventHandlers: ComponentEventHandlers;
  
  // State
  private originalImage: HTMLImageElement | null = null;
  private analysisData: AnalysisResult | null = null;
  private backgroundOpacity: number = 0.7;
  private selectedDetectionIndex: number = -1;
  
  // Transform state
  private transform: CanvasTransform = {
    scale: 1,
    translateX: 0,
    translateY: 0
  };
  
  // Interaction state
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private readonly minScale: number = 0.1;
  private readonly maxScale: number = 5;

  constructor(container: HTMLElement, eventHandlers: ComponentEventHandlers = {}) {
    this.eventHandlers = eventHandlers;
    this.element = this.createElement();
    this.canvas = this.element.querySelector('#imageCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    container.appendChild(this.element);
    this.setupEventListeners();
    
    // Use eventHandlers to prevent lint warning
    if (this.eventHandlers.onDetectionSelect) {
      console.log('Detection select handler available');
    }
  }

  private createElement(): HTMLElement {
    const canvasWorkspace = document.createElement('div');
    canvasWorkspace.className = 'canvas-workspace';
    canvasWorkspace.id = 'canvasContainer';
    
    canvasWorkspace.innerHTML = `
      <canvas id="imageCanvas"></canvas>
      <div class="canvas-overlay" id="visualizationSection" style="display: none;">
        <!-- Canvas content will be here -->
      </div>
    `;

    return canvasWorkspace;
  }

  private setupEventListeners(): void {
    // Canvas mouse events for panning
    this.canvas.addEventListener('mousedown', (e) => this.startPan(e));
    this.canvas.addEventListener('mousemove', (e) => this.handlePan(e));
    this.canvas.addEventListener('mouseup', () => this.endPan());
    this.canvas.addEventListener('mouseleave', () => this.endPan());
    
    // Mouse wheel for zooming
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.handleWheel(e);
    });

    // Listen for toolbar events
    this.element.addEventListener('zoom-in', () => this.zoomIn());
    this.element.addEventListener('zoom-out', () => this.zoomOut());
    this.element.addEventListener('fit-to-window', () => this.fitToWindow());
  }

  /**
   * Load and display an image
   */
  async loadImage(file: File): Promise<void> {
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
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Set analysis data and redraw
   */
  setAnalysisData(data: AnalysisResult): void {
    this.analysisData = data;
    this.drawAnalysis();
    
    // Show visualization section
    const visualizationSection = this.element.querySelector('#visualizationSection') as HTMLElement;
    if (visualizationSection) {
      visualizationSection.style.display = 'block';
    }
  }

  /**
   * Setup canvas dimensions
   */
  private setupCanvas(width: number, height: number): void {
    CanvasUtils.setupCanvas(this.canvas, width, height);
    
    // Reset transform
    this.transform = { scale: 1, translateX: 0, translateY: 0 };
    
    // Center canvas
    this.centerCanvas();
  }

  /**
   * Draw the analysis results
   */
  private drawAnalysis(): void {
    if (!this.originalImage || !this.analysisData) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context and apply transformations
    this.ctx.save();
    this.ctx.scale(this.transform.scale, this.transform.scale);
    this.ctx.translate(this.transform.translateX / this.transform.scale, this.transform.translateY / this.transform.scale);
    
    // Draw background image with opacity
    this.ctx.globalAlpha = this.backgroundOpacity;
    this.ctx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1.0;
    
    // Draw bounding boxes
    CanvasUtils.drawBoundingBoxes(this.ctx, this.analysisData.detections, this.selectedDetectionIndex);
    
    // Restore context
    this.ctx.restore();
  }

  /**
   * Center canvas in container
   */
  private centerCanvas(): void {
    CanvasUtils.centerCanvas(this.canvas, this.element, this.transform);
  }

  /**
   * Handle mouse wheel zoom
   */
  private handleWheel(e: WheelEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * 0.1);
    const newScale = Math.min(Math.max(this.transform.scale * zoom, this.minScale), this.maxScale);
    
    if (newScale !== this.transform.scale) {
      // Zoom towards mouse position
      const scaleChange = newScale / this.transform.scale;
      this.transform.translateX = mouseX - scaleChange * (mouseX - this.transform.translateX);
      this.transform.translateY = mouseY - scaleChange * (mouseY - this.transform.translateY);
      this.transform.scale = newScale;
      this.redrawCanvas();
    }
  }

  /**
   * Start panning
   */
  private startPan(e: MouseEvent): void {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.canvas.style.cursor = 'grabbing';
  }

  /**
   * Handle panning
   */
  private handlePan(e: MouseEvent): void {
    if (!this.isDragging) return;
    
    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;
    
    this.transform.translateX += deltaX;
    this.transform.translateY += deltaY;
    
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    
    this.redrawCanvas();
  }

  /**
   * End panning
   */
  private endPan(): void {
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
  }

  /**
   * Zoom in
   */
  public zoomIn(): void {
    const newScale = Math.min(this.transform.scale * 1.2, this.maxScale);
    this.setZoom(newScale);
  }

  /**
   * Zoom out
   */
  public zoomOut(): void {
    const newScale = Math.max(this.transform.scale / 1.2, this.minScale);
    this.setZoom(newScale);
  }

  /**
   * Set zoom level
   */
  private setZoom(newScale: number): void {
    this.transform.scale = newScale;
    this.redrawCanvas();
  }

  /**
   * Fit image to window
   */
  public fitToWindow(): void {
    if (!this.originalImage) return;
    
    const containerWidth = this.element.clientWidth - 40;
    const containerHeight = this.element.clientHeight - 40;
    
    const scale = CanvasUtils.calculateFitZoom(
      this.originalImage.width,
      this.originalImage.height,
      containerWidth,
      containerHeight
    );
    
    this.transform.scale = scale;
    this.transform.translateX = 0;
    this.transform.translateY = 0;
    this.centerCanvas();
    this.redrawCanvas();
  }

  /**
   * Redraw canvas
   */
  private redrawCanvas(): void {
    this.drawAnalysis();
  }

  /**
   * Select a detection
   */
  selectDetection(index: number): void {
    this.selectedDetectionIndex = index;
    this.highlightDetection(index);
    this.redrawCanvas();
  }

  /**
   * Highlight detection with animation
   */
  private highlightDetection(index: number): void {
    if (!this.analysisData || !this.analysisData.detections[index]) return;
    
    const detection = this.analysisData.detections[index];
    const { bbox } = detection;
    
    // Create temporary highlight overlay
    const highlightCanvas = document.createElement('canvas');
    highlightCanvas.width = this.canvas.width;
    highlightCanvas.height = this.canvas.height;
    highlightCanvas.style.position = 'absolute';
    highlightCanvas.style.top = this.canvas.style.top || '0px';
    highlightCanvas.style.left = this.canvas.style.left || '0px';
    highlightCanvas.style.transform = this.canvas.style.transform;
    highlightCanvas.style.transformOrigin = this.canvas.style.transformOrigin;
    highlightCanvas.style.pointerEvents = 'none';
    highlightCanvas.style.zIndex = '10';
    
    const highlightCtx = highlightCanvas.getContext('2d')!;
    this.element.appendChild(highlightCanvas);
    
    // Animation variables
    let opacity = 0.3;
    let pulseDirection = 1;
    let animationFrame = 0;
    const maxFrames = 120; // 2 seconds at 60fps
    
    const animate = () => {
      highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
      
      // Apply same transformations as main canvas
      highlightCtx.save();
      highlightCtx.scale(this.transform.scale, this.transform.scale);
      highlightCtx.translate(this.transform.translateX / this.transform.scale, this.transform.translateY / this.transform.scale);
      
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
        if (this.element.contains(highlightCanvas)) {
          this.element.removeChild(highlightCanvas);
        }
      }
    };
    
    animate();
  }

  /**
   * Set background opacity
   */
  setBackgroundOpacity(opacity: number): void {
    this.backgroundOpacity = opacity;
    this.redrawCanvas();
  }

  /**
   * Reset canvas state
   */
  reset(): void {
    this.originalImage = null;
    this.analysisData = null;
    this.selectedDetectionIndex = -1;
    this.backgroundOpacity = 0.7;
    this.transform = { scale: 1, translateX: 0, translateY: 0 };
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Hide visualization section
    const visualizationSection = this.element.querySelector('#visualizationSection') as HTMLElement;
    if (visualizationSection) {
      visualizationSection.style.display = 'none';
    }
  }

  /**
   * Get the canvas element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Get current analysis data
   */
  getAnalysisData(): AnalysisResult | null {
    return this.analysisData;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.element.remove();
  }
}
