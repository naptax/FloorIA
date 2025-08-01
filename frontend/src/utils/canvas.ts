// FloorIA Canvas Utilities

import type { BoundingBox, Detection, CanvasTransform } from '@/types';
import { getElementTypeColor } from '@/utils/detection';

export class CanvasUtils {
  /**
   * Setup canvas with proper dimensions and scaling
   */
  static setupCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
    canvas.width = width;
    canvas.height = height;
  }

  /**
   * Center canvas in its container
   */
  static centerCanvas(canvas: HTMLCanvasElement, container: HTMLElement, transform: CanvasTransform): void {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaledWidth = canvas.width * transform.scale;
    const scaledHeight = canvas.height * transform.scale;
    
    canvas.style.position = 'absolute';
    canvas.style.left = Math.max(0, (containerWidth - scaledWidth) / 2) + 'px';
    canvas.style.top = Math.max(0, (containerHeight - scaledHeight) / 2) + 'px';
    canvas.style.transform = `scale(${transform.scale})`;
    canvas.style.transformOrigin = 'top left';
  }

  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 0, b: 0 }; // Default to red if parsing fails
  }

  /**
   * Draw bounding boxes for detections
   */
  static drawBoundingBoxes(
    ctx: CanvasRenderingContext2D,
    detections: Detection[],
    selectedIndex: number = -1
  ): void {
    detections.forEach((detection, index) => {
      const { bbox, label, confidence } = detection;
      const isSelected = index === selectedIndex;
      
      // Get element type color
      const elementColor = getElementTypeColor(label);
      const elementColorRgb = CanvasUtils.hexToRgb(elementColor);
      
      // Set colors based on selection and element type
      if (isSelected) {
        ctx.strokeStyle = '#667eea'; // Keep selection highlight color
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
      } else {
        ctx.strokeStyle = elementColor;
        ctx.lineWidth = 3;
        ctx.fillStyle = `rgba(${elementColorRgb.r}, ${elementColorRgb.g}, ${elementColorRgb.b}, 0.25)`;
      }
      
      const { x, y, width, height } = bbox;
      
      // Draw bounding box
      ctx.strokeRect(x, y, width, height);
      ctx.fillRect(x, y, width, height);
      
      // Draw label with confidence
      const text = `${label} (${(confidence * 100).toFixed(1)}%)`;
      const textMetrics = ctx.measureText(text);
      const textHeight = 18;
      
      // Background for text
      ctx.fillStyle = isSelected ? 'rgba(102, 126, 234, 0.9)' : `rgba(${elementColorRgb.r}, ${elementColorRgb.g}, ${elementColorRgb.b}, 0.9)`;
      ctx.fillRect(x, y - textHeight, textMetrics.width + 10, textHeight);
      
      // Text
      ctx.fillStyle = 'white';
      ctx.fillText(text, x + 5, y - 5);
    });
  }

  /**
   * Calculate optimal zoom to fit content in container
   */
  static calculateFitZoom(
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number,
    padding: number = 40
  ): number {
    const availableWidth = containerWidth - padding;
    const availableHeight = containerHeight - padding;
    
    const scaleX = availableWidth / imageWidth;
    const scaleY = availableHeight / imageHeight;
    
    return Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  static screenToCanvas(
    screenX: number,
    screenY: number,
    canvas: HTMLCanvasElement,
    transform: CanvasTransform
  ): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const canvasX = (screenX - rect.left) / transform.scale - transform.translateX / transform.scale;
    const canvasY = (screenY - rect.top) / transform.scale - transform.translateY / transform.scale;
    
    return { x: canvasX, y: canvasY };
  }

  /**
   * Check if point is inside bounding box
   */
  static isPointInBoundingBox(x: number, y: number, bbox: BoundingBox): boolean {
    return x >= bbox.x && 
           x <= bbox.x + bbox.width && 
           y >= bbox.y && 
           y <= bbox.y + bbox.height;
  }
}
