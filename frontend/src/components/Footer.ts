// FloorIA Footer Component

import type { ModelInfo } from '@/types';
import { apiClient } from '@/utils/api';

export class Footer {
  private element: HTMLElement;

  constructor(container: HTMLElement) {
    this.element = this.createElement();
    container.appendChild(this.element);
    this.loadModelInfo();
  }

  private createElement(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'footer';
    
    footer.innerHTML = `
      <div class="footer-left">
        <span><strong>FloorIA</strong> - Analyse Architecturale par IA</span>
      </div>
      <div class="footer-center">
        <div class="model-info">
          <div class="model-name" id="modelName">Modèle: --</div>
          <div class="model-metrics">
            <span class="metric" id="mapMetric">mAP: --</span>
            <span class="metric" id="precisionMetric">Précision: --</span>
            <span class="metric" id="recallMetric">Rappel: --</span>
          </div>
        </div>
      </div>
      <div class="footer-right">
        <a href="#" onclick="window.open('https://www.deep-5.com', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes'); return false;" style="color: #ffffff; text-decoration: none; transition: color 0.2s ease; cursor: pointer;">Deep-5</a>
        <span>|</span>
        <span>60 rue François 1er, 75008 PARIS</span>
        <span>|</span>
        <span>From Paris with ❤️</span>
      </div>
    `;

    return footer;
  }

  /**
   * Load and display Roboflow model information
   */
  private async loadModelInfo(): Promise<void> {
    try {
      const modelInfo = await apiClient.getModelInfo();
      this.updateModelInfo(modelInfo);
    } catch (error) {
      console.warn('Error loading model info:', error);
      // Keep default values if API call fails
    }
  }

  /**
   * Update footer with model information
   */
  private updateModelInfo(modelInfo: ModelInfo): void {
    const modelNameElement = this.element.querySelector('#modelName') as HTMLElement;
    const mapMetricElement = this.element.querySelector('#mapMetric') as HTMLElement;
    const precisionMetricElement = this.element.querySelector('#precisionMetric') as HTMLElement;
    const recallMetricElement = this.element.querySelector('#recallMetric') as HTMLElement;

    if (modelNameElement) {
      modelNameElement.textContent = `Modèle: ${modelInfo.model_name}`;
    }

    if (mapMetricElement && modelInfo.metrics) {
      mapMetricElement.textContent = `mAP: ${modelInfo.metrics.mAP}`;
    }

    if (precisionMetricElement && modelInfo.metrics) {
      precisionMetricElement.textContent = `Précision: ${modelInfo.metrics.precision}`;
    }

    if (recallMetricElement && modelInfo.metrics) {
      recallMetricElement.textContent = `Rappel: ${modelInfo.metrics.recall}`;
    }

    console.log('Model info loaded:', modelInfo);
  }

  /**
   * Get the footer element
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
