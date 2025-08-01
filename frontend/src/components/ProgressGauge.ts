// FloorIA Progress Gauge Component

export class ProgressGauge {
  private element: HTMLElement;
  private progressValue: number = 0;
  private isVisible: boolean = false;
  private animationId: number | null = null;

  constructor(container: HTMLElement) {
    this.element = this.createElement();
    container.appendChild(this.element);
  }

  private createElement(): HTMLElement {
    const gauge = document.createElement('div');
    gauge.className = 'progress-gauge';
    gauge.style.display = 'none';
    
    gauge.innerHTML = `
      <div class="gauge-overlay">
        <div class="gauge-container">
          <div class="gauge-header">
            <h3>🤖 Analyse IA en cours</h3>
            <p>Détection des éléments architecturaux...</p>
          </div>
          
          <div class="gauge-visual">
            <svg class="gauge-svg" viewBox="0 0 200 200" width="200" height="200">
              <!-- Background circle -->
              <circle 
                cx="100" 
                cy="100" 
                r="85" 
                fill="none" 
                stroke="#3c3c3c" 
                stroke-width="8"
                class="gauge-bg"
              />
              
              <!-- Progress circle -->
              <circle 
                cx="100" 
                cy="100" 
                r="85" 
                fill="none" 
                stroke="url(#gaugeGradient)" 
                stroke-width="8" 
                stroke-linecap="round"
                class="gauge-progress"
                stroke-dasharray="534.07"
                stroke-dashoffset="534.07"
                transform="rotate(-90 100 100)"
              />
              
              <!-- Gradient definition -->
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#007acc;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#4fc3f7;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#29b6f6;stop-opacity:1" />
                </linearGradient>
              </defs>
              
              <!-- Central icon -->
              <g class="gauge-icon" transform="translate(100, 100)">
                <circle r="25" fill="#252526" stroke="#007acc" stroke-width="2"/>
                <text x="0" y="8" text-anchor="middle" font-family="Consolas, monospace" font-size="24" fill="#007acc">🏗️</text>
              </g>
            </svg>
            
            <!-- Percentage text -->
            <div class="gauge-percentage">
              <span class="percentage-value">0</span>
              <span class="percentage-symbol">%</span>
            </div>
          </div>
          
          <div class="gauge-status">
            <div class="status-text">Initialisation...</div>
            <div class="status-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
          
          <div class="gauge-steps">
            <div class="step active">📷 Chargement image</div>
            <div class="step">🔍 Analyse IA</div>
            <div class="step">📊 Traitement résultats</div>
            <div class="step">✅ Terminé</div>
          </div>
        </div>
      </div>
    `;

    return gauge;
  }

  /**
   * Show the progress gauge
   */
  show(): void {
    this.isVisible = true;
    this.element.style.display = 'flex';
    this.startProgress();
  }

  /**
   * Hide the progress gauge
   */
  hide(): void {
    this.isVisible = false;
    this.element.style.display = 'none';
    this.stopProgress();
    this.reset();
  }

  /**
   * Start the progress animation
   */
  private startProgress(): void {
    this.progressValue = 0;
    this.updateStep(0, "📷 Chargement image...");
    
    // Simulate progress phases
    setTimeout(() => {
      if (this.isVisible) {
        this.setProgress(25);
        this.updateStep(1, "🔍 Analyse IA en cours...");
      }
    }, 500);

    setTimeout(() => {
      if (this.isVisible) {
        this.setProgress(60);
        this.updateStep(2, "📊 Traitement des résultats...");
      }
    }, 1500);

    setTimeout(() => {
      if (this.isVisible) {
        this.setProgress(85);
        this.updateStep(3, "🎯 Finalisation...");
      }
    }, 2500);
  }

  /**
   * Set progress value (0-100)
   */
  private setProgress(value: number): void {
    this.progressValue = Math.max(0, Math.min(100, value));
    
    const progressCircle = this.element.querySelector('.gauge-progress') as SVGCircleElement;
    const percentageValue = this.element.querySelector('.percentage-value') as HTMLElement;
    
    if (progressCircle && percentageValue) {
      const circumference = 534.07; // 2 * PI * 85
      const offset = circumference - (this.progressValue / 100) * circumference;
      
      progressCircle.style.strokeDashoffset = offset.toString();
      percentageValue.textContent = Math.round(this.progressValue).toString();
    }
  }

  /**
   * Update current step
   */
  private updateStep(stepIndex: number, statusText: string): void {
    const steps = this.element.querySelectorAll('.step');
    const statusElement = this.element.querySelector('.status-text') as HTMLElement;
    
    // Update steps
    steps.forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index < stepIndex) {
        step.classList.add('completed');
      } else if (index === stepIndex) {
        step.classList.add('active');
      }
    });
    
    // Update status text
    if (statusElement) {
      statusElement.textContent = statusText;
    }
  }

  /**
   * Complete the progress (called when analysis is done)
   */
  complete(): void {
    this.setProgress(100);
    this.updateStep(3, "✅ Analyse terminée !");
    
    // Hide after a short delay
    setTimeout(() => {
      this.hide();
    }, 1000);
  }

  /**
   * Stop progress animation
   */
  private stopProgress(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Reset the gauge
   */
  private reset(): void {
    this.progressValue = 0;
    this.setProgress(0);
    this.updateStep(0, "Initialisation...");
  }

  /**
   * Get the gauge element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.stopProgress();
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
