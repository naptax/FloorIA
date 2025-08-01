// FloorIA Scale Calibrator Component

import { ScaleCalibrator } from '@/utils/scale';

export class ScaleCalibratorComponent {
  private element: HTMLElement;
  private calibrator: ScaleCalibrator;
  private onScaleChange?: (scale: number) => void;

  constructor(container: HTMLElement, onScaleChange?: (scale: number) => void) {
    this.calibrator = ScaleCalibrator.getInstance();
    this.onScaleChange = onScaleChange;
    this.element = this.createElement();
    container.appendChild(this.element);
    
    // Load existing scale
    this.calibrator.loadScale();
    this.updateDisplay();
  }

  private createElement(): HTMLElement {
    const calibratorDiv = document.createElement('div');
    calibratorDiv.className = 'scale-calibrator';
    calibratorDiv.style.display = 'none';
    
    calibratorDiv.innerHTML = `
      <div class="calibrator-overlay">
        <div class="calibrator-modal">
          <div class="calibrator-header">
            <h3>📏 Calibration d'Échelle</h3>
            <button class="close-btn" id="closeCalibratorBtn">×</button>
          </div>
          
          <div class="calibrator-content">
            <p class="calibrator-description">
              Pour afficher les mesures en mètres, définissez l'échelle de votre plan architectural.
            </p>
            
            <div class="scale-presets">
              <h4>Échelles courantes :</h4>
              <div class="preset-buttons">
                <button class="preset-btn" data-scale="25">1:200 (0.5cm = 1m)</button>
                <button class="preset-btn" data-scale="50">1:100 (1cm = 1m)</button>
                <button class="preset-btn" data-scale="100">1:50 (2cm = 1m)</button>
                <button class="preset-btn" data-scale="200">1:25 (4cm = 1m)</button>
              </div>
            </div>
            
            <div class="custom-scale">
              <h4>Échelle personnalisée :</h4>
              <div class="scale-input-group">
                <label for="pixelsPerMeter">Pixels par mètre :</label>
                <input type="number" id="pixelsPerMeter" min="1" max="1000" step="1" value="100">
                <span class="scale-help">
                  💡 Astuce : Mesurez un élément de taille connue sur votre plan
                </span>
              </div>
            </div>
            
            <div class="scale-preview">
              <h4>Aperçu :</h4>
              <div class="preview-info">
                <div class="preview-item">
                  <span>100 pixels =</span>
                  <span id="previewMeters">1.00 m</span>
                </div>
                <div class="preview-item">
                  <span>1 pixel =</span>
                  <span id="previewCentimeters">1.00 cm</span>
                </div>
              </div>
            </div>
            
            <div class="calibrator-status">
              <div class="status-indicator" id="statusIndicator">
                <span class="status-icon">⚠️</span>
                <span class="status-text">Échelle non calibrée - mesures en pixels</span>
              </div>
            </div>
          </div>
          
          <div class="calibrator-actions">
            <button class="btn btn-secondary" id="resetScaleBtn">Réinitialiser</button>
            <button class="btn btn-primary" id="applyScaleBtn">Appliquer l'Échelle</button>
          </div>
        </div>
      </div>
    `;

    return calibratorDiv;
  }

  /**
   * Show the scale calibrator
   */
  show(): void {
    this.element.style.display = 'flex';
    this.setupEventListeners();
    this.updateDisplay();
  }

  /**
   * Hide the scale calibrator
   */
  hide(): void {
    this.element.style.display = 'none';
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const closeBtn = this.element.querySelector('#closeCalibratorBtn') as HTMLButtonElement;
    const applyBtn = this.element.querySelector('#applyScaleBtn') as HTMLButtonElement;
    const resetBtn = this.element.querySelector('#resetScaleBtn') as HTMLButtonElement;
    const pixelsInput = this.element.querySelector('#pixelsPerMeter') as HTMLInputElement;
    const presetButtons = this.element.querySelectorAll('.preset-btn');

    // Close button
    closeBtn?.addEventListener('click', () => this.hide());

    // Preset buttons
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scale = parseInt((e.target as HTMLElement).dataset.scale || '100');
        pixelsInput.value = scale.toString();
        this.updatePreview(scale);
      });
    });

    // Custom input
    pixelsInput?.addEventListener('input', (e) => {
      const scale = parseInt((e.target as HTMLInputElement).value) || 100;
      this.updatePreview(scale);
    });

    // Apply button
    applyBtn?.addEventListener('click', () => {
      const scale = parseInt(pixelsInput.value) || 100;
      this.calibrator.setScale(scale);
      this.updateDisplay();
      
      if (this.onScaleChange) {
        this.onScaleChange(scale);
      }
      
      this.hide();
    });

    // Reset button
    resetBtn?.addEventListener('click', () => {
      this.calibrator.resetScale();
      pixelsInput.value = '100';
      this.updatePreview(100);
      this.updateDisplay();
      
      if (this.onScaleChange) {
        this.onScaleChange(100);
      }
    });

    // Click outside to close
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.hide();
      }
    });
  }

  /**
   * Update preview calculations
   */
  private updatePreview(pixelsPerMeter: number): void {
    const previewMeters = this.element.querySelector('#previewMeters') as HTMLElement;
    const previewCentimeters = this.element.querySelector('#previewCentimeters') as HTMLElement;

    if (previewMeters && previewCentimeters) {
      const meters = 100 / pixelsPerMeter;
      const centimeters = 100 / pixelsPerMeter;

      previewMeters.textContent = `${meters.toFixed(2)} m`;
      previewCentimeters.textContent = `${centimeters.toFixed(2)} cm`;
    }
  }

  /**
   * Update display based on current calibration
   */
  private updateDisplay(): void {
    const statusIndicator = this.element.querySelector('#statusIndicator') as HTMLElement;
    const statusIcon = this.element.querySelector('.status-icon') as HTMLElement;
    const statusText = this.element.querySelector('.status-text') as HTMLElement;
    const pixelsInput = this.element.querySelector('#pixelsPerMeter') as HTMLInputElement;

    if (statusIndicator && statusIcon && statusText && pixelsInput) {
      const isCalibrated = this.calibrator.getIsCalibrated();
      const currentScale = this.calibrator.getScale();

      pixelsInput.value = currentScale.toString();
      this.updatePreview(currentScale);

      if (isCalibrated) {
        statusIndicator.style.color = '#4caf50';
        statusIcon.textContent = '✅';
        statusText.textContent = `Échelle calibrée : ${currentScale} pixels/mètre`;
      } else {
        statusIndicator.style.color = '#ff9800';
        statusIcon.textContent = '⚠️';
        statusText.textContent = 'Échelle non calibrée - mesures en pixels';
      }
    }
  }

  /**
   * Get the calibrator element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
