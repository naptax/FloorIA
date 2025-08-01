// FloorIA Scale Conversion Utilities

/**
 * Scale calibration for converting pixels to meters
 */
export class ScaleCalibrator {
  private static instance: ScaleCalibrator;
  private pixelsPerMeter: number = 100; // Default: 100 pixels = 1 meter
  private isCalibrated: boolean = false;

  private constructor() {}

  static getInstance(): ScaleCalibrator {
    if (!ScaleCalibrator.instance) {
      ScaleCalibrator.instance = new ScaleCalibrator();
    }
    return ScaleCalibrator.instance;
  }

  /**
   * Set the scale calibration
   * @param pixelsPerMeter Number of pixels that represent 1 meter
   */
  setScale(pixelsPerMeter: number): void {
    this.pixelsPerMeter = pixelsPerMeter;
    this.isCalibrated = true;
    
    // Store in localStorage for persistence
    localStorage.setItem('floorIA_scale', pixelsPerMeter.toString());
    localStorage.setItem('floorIA_scale_calibrated', 'true');
  }

  /**
   * Load scale from localStorage if available
   */
  loadScale(): void {
    const savedScale = localStorage.getItem('floorIA_scale');
    const isCalibrated = localStorage.getItem('floorIA_scale_calibrated');
    
    if (savedScale && isCalibrated) {
      this.pixelsPerMeter = parseFloat(savedScale);
      this.isCalibrated = true;
    }
  }

  /**
   * Get current scale (pixels per meter)
   */
  getScale(): number {
    return this.pixelsPerMeter;
  }

  /**
   * Check if scale has been calibrated by user
   */
  getIsCalibrated(): boolean {
    return this.isCalibrated;
  }

  /**
   * Convert pixels to meters
   */
  pixelsToMeters(pixels: number): number {
    return pixels / this.pixelsPerMeter;
  }

  /**
   * Convert meters to pixels
   */
  metersToPixels(meters: number): number {
    return meters * this.pixelsPerMeter;
  }

  /**
   * Convert pixel area to square meters
   */
  pixelAreaToSquareMeters(pixelArea: number): number {
    return pixelArea / (this.pixelsPerMeter * this.pixelsPerMeter);
  }

  /**
   * Reset calibration to default
   */
  resetScale(): void {
    this.pixelsPerMeter = 100;
    this.isCalibrated = false;
    localStorage.removeItem('floorIA_scale');
    localStorage.removeItem('floorIA_scale_calibrated');
  }

  /**
   * Get suggested scales for common architectural drawings
   */
  static getSuggestedScales(): Array<{ name: string; pixelsPerMeter: number; description: string }> {
    return [
      { name: '1:100', pixelsPerMeter: 50, description: 'Plan architectural standard (1cm = 1m)' },
      { name: '1:50', pixelsPerMeter: 100, description: 'Plan détaillé (2cm = 1m)' },
      { name: '1:25', pixelsPerMeter: 200, description: 'Plan très détaillé (4cm = 1m)' },
      { name: '1:200', pixelsPerMeter: 25, description: 'Plan d\'ensemble (0.5cm = 1m)' },
      { name: 'Personnalisé', pixelsPerMeter: 100, description: 'Définir une échelle personnalisée' }
    ];
  }
}

/**
 * Format a measurement value with appropriate unit and precision
 */
export function formatMeasurement(pixels: number, unit: 'pixels' | 'meters' = 'meters'): string {
  const calibrator = ScaleCalibrator.getInstance();
  
  if (unit === 'pixels' || !calibrator.getIsCalibrated()) {
    return `${Math.round(pixels)} px`;
  }
  
  const meters = calibrator.pixelsToMeters(pixels);
  
  if (meters < 0.01) {
    return `${(meters * 1000).toFixed(0)} mm`;
  } else if (meters < 1) {
    return `${(meters * 100).toFixed(1)} cm`;
  } else {
    return `${meters.toFixed(2)} m`;
  }
}

/**
 * Format an area measurement
 */
export function formatArea(pixelArea: number, unit: 'pixels' | 'meters' = 'meters'): string {
  const calibrator = ScaleCalibrator.getInstance();
  
  if (unit === 'pixels' || !calibrator.getIsCalibrated()) {
    return `${Math.round(pixelArea)} px²`;
  }
  
  const squareMeters = calibrator.pixelAreaToSquareMeters(pixelArea);
  
  if (squareMeters < 1) {
    return `${(squareMeters * 10000).toFixed(0)} cm²`;
  } else {
    return `${squareMeters.toFixed(2)} m²`;
  }
}

/**
 * Format dimensions (width x height)
 */
export function formatDimensions(width: number, height: number, unit: 'pixels' | 'meters' = 'meters'): string {
  const calibrator = ScaleCalibrator.getInstance();
  
  if (unit === 'pixels' || !calibrator.getIsCalibrated()) {
    return `${Math.round(width)}×${Math.round(height)} px`;
  }
  
  const widthM = calibrator.pixelsToMeters(width);
  const heightM = calibrator.pixelsToMeters(height);
  
  if (widthM < 1 && heightM < 1) {
    return `${(widthM * 100).toFixed(1)}×${(heightM * 100).toFixed(1)} cm`;
  } else {
    return `${widthM.toFixed(2)}×${heightM.toFixed(2)} m`;
  }
}

/**
 * Get unit suffix for display
 */
export function getUnitSuffix(): string {
  const calibrator = ScaleCalibrator.getInstance();
  return calibrator.getIsCalibrated() ? 'm' : 'px';
}
