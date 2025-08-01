// FloorIA Toolbar Component

import type { ComponentEventHandlers } from '@/types';

export class Toolbar {
  private element: HTMLElement;
  private eventHandlers: ComponentEventHandlers;

  constructor(container: HTMLElement, eventHandlers: ComponentEventHandlers = {}) {
    this.eventHandlers = eventHandlers;
    this.element = this.createElement();
    container.appendChild(this.element);
    this.setupEventListeners();
  }

  private createElement(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    
    toolbar.innerHTML = `
      <input type="file" id="fileInput" class="file-input" accept="image/*">
      <button class="toolbar-btn" id="importBtn">📁 Importer</button>
      <div class="toolbar-separator"></div>
      <button class="toolbar-btn" id="zoomInBtn">🔍+</button>
      <button class="toolbar-btn" id="zoomOutBtn">🔍-</button>
      <button class="toolbar-btn" id="fitBtn">📐 Ajuster</button>
      <div class="toolbar-separator"></div>
      <button class="toolbar-btn" id="scaleBtn" title="Calibration d'échelle">📏 Échelle</button>
      <div class="toolbar-separator"></div>
      <button class="toolbar-btn" id="exportBtn" title="Exporter les résultats en JSON">💾 Export JSON</button>
      <div class="toolbar-separator"></div>
      <label style="color: #cccccc; font-size: 0.8rem;">Opacité:</label>
      <input type="range" id="opacitySlider" class="slider" min="0" max="100" value="70" style="width: 100px;">
      <span id="opacityValue" style="color: #cccccc; font-size: 0.8rem;">70%</span>
      <button id="resetBtn" class="btn btn-secondary">Réinitialiser</button>
    `;

    return toolbar;
  }

  private setupEventListeners(): void {
    const fileInput = this.element.querySelector('#fileInput') as HTMLInputElement;
    const importBtn = this.element.querySelector('#importBtn') as HTMLButtonElement;
    const zoomInBtn = this.element.querySelector('#zoomInBtn') as HTMLButtonElement;
    const zoomOutBtn = this.element.querySelector('#zoomOutBtn') as HTMLButtonElement;
    const fitBtn = this.element.querySelector('#fitBtn') as HTMLButtonElement;
    const scaleBtn = this.element.querySelector('#scaleBtn') as HTMLButtonElement;
    const exportBtn = this.element.querySelector('#exportBtn') as HTMLButtonElement;
    const opacitySlider = this.element.querySelector('#opacitySlider') as HTMLInputElement;
    const opacityValue = this.element.querySelector('#opacityValue') as HTMLSpanElement;
    const resetBtn = this.element.querySelector('#resetBtn') as HTMLButtonElement;

    // File input
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0 && this.eventHandlers.onFileUpload) {
          this.eventHandlers.onFileUpload(target.files[0]);
        }
      });
    }

    // Import button
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        fileInput?.click();
      });
    }

    // Zoom controls
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        // Will be handled by parent component
        this.element.dispatchEvent(new CustomEvent('zoom-in'));
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        this.element.dispatchEvent(new CustomEvent('zoom-out'));
      });
    }

    if (fitBtn) {
      fitBtn.addEventListener('click', () => {
        this.element.dispatchEvent(new CustomEvent('fit-to-window'));
      });
    }

    // Scale calibrator button
    if (scaleBtn) {
      scaleBtn.addEventListener('click', () => {
        this.element.dispatchEvent(new CustomEvent('open-scale-calibrator'));
      });
    }

    // Export JSON button
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.element.dispatchEvent(new CustomEvent('export-json'));
      });
    }

    // Opacity slider
    if (opacitySlider && opacityValue) {
      opacitySlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        opacityValue.textContent = `${value}%`;
        
        if (this.eventHandlers.onOpacityChange) {
          this.eventHandlers.onOpacityChange(value / 100);
        }
      });
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.eventHandlers.onReset) {
          this.eventHandlers.onReset();
        }
        
        // Reset UI elements
        if (fileInput) fileInput.value = '';
        if (opacitySlider) opacitySlider.value = '70';
        if (opacityValue) opacityValue.textContent = '70%';
      });
    }
  }

  /**
   * Update opacity slider value
   */
  updateOpacity(opacity: number): void {
    const opacitySlider = this.element.querySelector('#opacitySlider') as HTMLInputElement;
    const opacityValue = this.element.querySelector('#opacityValue') as HTMLSpanElement;
    
    const percentage = Math.round(opacity * 100);
    
    if (opacitySlider) {
      opacitySlider.value = percentage.toString();
    }
    
    if (opacityValue) {
      opacityValue.textContent = `${percentage}%`;
    }
  }

  /**
   * Get the toolbar element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.element.remove();
  }
}
