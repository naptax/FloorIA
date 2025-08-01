// FloorIA Header Component

export class Header {
  private element: HTMLElement;

  constructor(container: HTMLElement) {
    this.element = this.createElement();
    container.appendChild(this.element);
  }

  private createElement(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'header-bar';
    
    header.innerHTML = `
      <div class="logo">
        <img src="assets/logo.svg" alt="FloorIA" title="FloorIA - Analyse Architecturale IA">
      </div>
      <div class="project-info">
        <span>Analyse Architecturale par IA</span>
        <span>|</span>
        <span id="projectStatus">Prêt</span>
      </div>
    `;

    return header;
  }

  /**
   * Update project status
   */
  updateStatus(status: string): void {
    const statusElement = this.element.querySelector('#projectStatus');
    if (statusElement) {
      statusElement.textContent = status;
    }
  }

  /**
   * Get the header element
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
