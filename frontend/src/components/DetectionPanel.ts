// FloorIA Detection Panel Component

import type { Detection, SortKey, ComponentEventHandlers } from '@/types';
import { enhanceDetections, getElementTypeColor } from '@/utils/detection';
import { formatMeasurement, formatArea, formatDimensions } from '@/utils/scale';

export class DetectionPanel {
  private element: HTMLElement;
  private eventHandlers: ComponentEventHandlers;
  private detections: Detection[] = [];
  private originalDetections: Detection[] = [];
  private sortColumn: SortKey | null = null;
  private sortDirection: 'asc' | 'desc' = 'asc';
  private visibleDetections: Set<string> = new Set(); // Track which detections are visible

  constructor(container: HTMLElement, eventHandlers: ComponentEventHandlers = {}) {
    this.eventHandlers = eventHandlers;
    this.element = this.createElement();
    container.appendChild(this.element);
    this.setupEventListeners();
  }

  private createElement(): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar-right';
    
    sidebar.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h3>Détections</h3>
        </div>
        <div class="panel-content">
          <!-- Sorting Controls -->
          <div class="sort-controls">
            <select id="sortSelect" class="sort-select">
              <option value="index">Index</option>
              <option value="label">Type</option>
              <option value="confidence">Confiance</option>
              <option value="area">Surface</option>
              <option value="perimeter">Périmètre</option>
            </select>
            <button id="sortDirection" class="sort-direction" title="Ordre de tri">↑</button>
          </div>
          
          <!-- Detection List -->
          <div class="detection-list" id="detectionList">
            <!-- Detection cards will be populated here -->
          </div>
          
          <!-- Loading State -->
          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Analyse en cours...</p>
          </div>
          
          <!-- Error State -->
          <div class="error" id="errorMessage">
            <!-- Error message will be displayed here -->
          </div>
        </div>
      </div>
    `;

    return sidebar;
  }

  private setupEventListeners(): void {
    const sortSelect = this.element.querySelector('#sortSelect') as HTMLSelectElement;
    const sortDirectionBtn = this.element.querySelector('#sortDirection') as HTMLButtonElement;

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.sortTable(target.value as SortKey);
      });
    }

    if (sortDirectionBtn) {
      sortDirectionBtn.addEventListener('click', () => {
        // Toggle direction and re-sort
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.updateSortIndicators();
        
        if (this.sortColumn) {
          const sortedDetections = this.getSortedDetections(this.sortColumn, this.sortDirection);
          this.detections = sortedDetections;
          this.populateDetectionList();
        }
      });
    }
  }

  /**
   * Set detections data
   */
  setDetections(detections: Omit<Detection, 'id' | 'shortName'>[]): void {
    // Enhance detections with permanent IDs and short names
    this.detections = enhanceDetections(detections);
    this.originalDetections = this.detections;
    
    // Initialize all detections as visible by default
    this.visibleDetections.clear();
    this.detections.forEach(detection => {
      this.visibleDetections.add(detection.id);
    });
    
    this.populateDetectionList();
  }

  /**
   * Populate the detection list
   */
  private populateDetectionList(): void {
    const container = this.element.querySelector('#detectionList') as HTMLElement;
    if (!container) return;
    
    container.innerHTML = '';
    
    this.detections.forEach((detection, index) => {
      const card = this.createDetectionCard(detection, index);
      container.appendChild(card);
    });
  }

  /**
   * Create a detection card element
   */
  private createDetectionCard(detection: Detection, index: number): HTMLElement {
    const { id, shortName, bbox, label, confidence, geometry } = detection;
    const elementColor = getElementTypeColor(label);
    const isVisible = this.visibleDetections.has(id);
    
    const card = document.createElement('div');
    card.className = 'detection-card';
    card.dataset.index = index.toString();
    card.dataset.id = id;
    
    // Add click event for card selection (but not on checkbox)
    card.addEventListener('click', (e) => {
      // Don't trigger selection if clicking on checkbox
      if ((e.target as HTMLInputElement).type === 'checkbox') return;
      
      this.selectDetection(index);
      if (this.eventHandlers.onDetectionSelect) {
        this.eventHandlers.onDetectionSelect(index);
      }
    });
    
    card.innerHTML = `
      <div class="detection-card-header">
        <div class="detection-visibility">
          <input type="checkbox" id="visibility-${id}" ${isVisible ? 'checked' : ''} class="visibility-checkbox">
          <label for="visibility-${id}" class="visibility-label">Afficher</label>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <div class="detection-id" style="background-color: ${elementColor}; color: #ffffff;">${shortName}</div>
          <div class="detection-type">${label}</div>
        </div>
      </div>
      
      <div class="confidence-section">
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${confidence * 100}%; background-color: ${elementColor};"></div>
        </div>
        <div class="confidence-text">Confiance: ${(confidence * 100).toFixed(1)}%</div>
      </div>
      
      <div class="detection-details">
        <div class="detail-item">
          <div class="detail-label">Element ID</div>
          <div class="detail-value" style="font-family: monospace; font-size: 0.7rem; opacity: 0.7;">${id.substring(0, 12)}...</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Position</div>
          <div class="detail-value">${formatMeasurement(bbox.x)}, ${formatMeasurement(bbox.y)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Dimensions</div>
          <div class="detail-value">${formatDimensions(bbox.width, bbox.height)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Surface</div>
          <div class="detail-value">${geometry ? formatArea(geometry.area) : 'N/A'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Périmètre</div>
          <div class="detail-value">${geometry ? formatMeasurement(geometry.perimeter) : 'N/A'}</div>
        </div>
      </div>
    `;
    
    // Add checkbox event listener after creating the card
    const checkbox = card.querySelector('.visibility-checkbox') as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation(); // Prevent card selection
        this.toggleDetectionVisibility(id, checkbox.checked);
      });
    }
    
    return card;
  }

  /**
   * Toggle detection visibility
   */
  private toggleDetectionVisibility(detectionId: string, isVisible: boolean): void {
    if (isVisible) {
      this.visibleDetections.add(detectionId);
    } else {
      this.visibleDetections.delete(detectionId);
    }
    
    // Notify canvas to update display
    if (this.eventHandlers.onVisibilityChange) {
      this.eventHandlers.onVisibilityChange(Array.from(this.visibleDetections));
    }
    
    console.log(`🔄 Detection ${detectionId} visibility: ${isVisible ? 'shown' : 'hidden'}`);
    console.log(`📊 Visible detections: ${this.visibleDetections.size}/${this.detections.length}`);
  }

  /**
   * Select a detection card (private method for internal use)
   */
  private selectDetection(index: number): void {
    this.selectDetectionPublic(index);
  }

  /**
   * Select a detection card (public method for external synchronization)
   */
  selectDetectionPublic(index: number): void {
    console.log('🔄 DetectionPanel: Selecting detection at index:', index);
    
    // Remove previous selection
    const previousSelected = this.element.querySelector('.detection-card.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
      console.log('🔄 DetectionPanel: Removed previous selection');
    }
    
    // Add new selection
    const newSelected = this.element.querySelector(`.detection-card[data-index="${index}"]`);
    if (newSelected) {
      newSelected.classList.add('selected');
      // Scroll the card into view
      newSelected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      console.log('✅ DetectionPanel: Selected detection card at index:', index);
    } else {
      console.log('⚠️ DetectionPanel: Could not find detection card at index:', index);
    }
  }

  /**
   * Sort the detection table
   */
  private sortTable(sortKey: SortKey): void {
    if (!this.detections.length) return;
    
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
    this.detections = sortedDetections;
    
    // Repopulate the list
    this.populateDetectionList();
    
    // Notify parent if handler exists
    if (this.eventHandlers.onSort) {
      this.eventHandlers.onSort(sortKey, this.sortDirection);
    }
  }

  /**
   * Get sorted detections
   */
  private getSortedDetections(sortKey: SortKey, direction: 'asc' | 'desc'): Detection[] {
    const detections = [...this.originalDetections];
    
    return detections.sort((a, b) => {
      let valueA: any, valueB: any;
      
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

  /**
   * Update sort indicators
   */
  private updateSortIndicators(): void {
    const sortDirectionBtn = this.element.querySelector('#sortDirection') as HTMLButtonElement;
    const sortSelect = this.element.querySelector('#sortSelect') as HTMLSelectElement;
    
    if (sortDirectionBtn) {
      sortDirectionBtn.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
      sortDirectionBtn.classList.toggle('desc', this.sortDirection === 'desc');
    }
    
    if (sortSelect && this.sortColumn) {
      sortSelect.value = this.sortColumn;
    }
  }

  /**
   * Show loading state
   */
  showLoading(show: boolean): void {
    const loadingElement = this.element.querySelector('#loading') as HTMLElement;
    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    const errorElement = this.element.querySelector('#errorMessage') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Hide error message
   */
  hideError(): void {
    const errorElement = this.element.querySelector('#errorMessage') as HTMLElement;
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  /**
   * Clear all detections
   */
  clear(): void {
    this.detections = [];
    this.originalDetections = [];
    this.sortColumn = null;
    this.sortDirection = 'asc';
    
    const container = this.element.querySelector('#detectionList') as HTMLElement;
    if (container) {
      container.innerHTML = '';
    }
    
    this.hideError();
  }

  /**
   * Refresh display (useful when scale changes)
   */
  refreshDisplay(): void {
    this.populateDetectionList();
  }

  /**
   * Get current detections
   */
  getDetections(): Detection[] {
    return this.detections;
  }

  /**
   * Get the panel element
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
