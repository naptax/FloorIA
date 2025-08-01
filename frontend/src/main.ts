// FloorIA Main Application Entry Point

import type { ComponentEventHandlers } from '@/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toolbar } from '@/components/Toolbar';
import { Canvas } from '@/components/Canvas';
import { DetectionPanel } from '@/components/DetectionPanel';
import { ProgressGauge } from '@/components/ProgressGauge';
import { ScaleCalibratorComponent } from '@/components/ScaleCalibrator';
import { apiClient } from '@/utils/api';
import { exportDetectionsToJSON } from '@/utils/export';
import '@/styles/main.css';

/**
 * Main FloorIA Application Class
 */
class FloorIAApp {
  private header!: Header;
  private footer!: Footer;
  private toolbar!: Toolbar;
  private canvas!: Canvas;
  private detectionPanel!: DetectionPanel;
  private progressGauge!: ProgressGauge;
  private scaleCalibrator!: ScaleCalibratorComponent;

  constructor() {
    this.initializeApp();
  }

  /**
   * Initialize the application and all components
   */
  private initializeApp(): void {
    const appContainer = document.querySelector('.app-container') as HTMLElement;
    if (!appContainer) {
      throw new Error('App container not found');
    }

    // Create event handlers for component communication
    const eventHandlers: ComponentEventHandlers = {
      onFileUpload: this.handleFileUpload.bind(this),
      onDetectionSelect: this.handleDetectionSelect.bind(this),
      onOpacityChange: this.handleOpacityChange.bind(this),
      onReset: this.handleReset.bind(this)
    };

    // Initialize components
    this.header = new Header(appContainer);
    this.footer = new Footer(appContainer);

    // Create main workspace
    const mainWorkspace = document.createElement('div');
    mainWorkspace.className = 'main-workspace';
    appContainer.appendChild(mainWorkspace);

    // Initialize toolbar and canvas
    this.toolbar = new Toolbar(mainWorkspace, eventHandlers);
    this.canvas = new Canvas(mainWorkspace, eventHandlers);
    
    // Connect toolbar events to canvas
    this.setupToolbarCanvasEvents();

    // Initialize detection panel
    this.detectionPanel = new DetectionPanel(appContainer, eventHandlers);

    // Initialize progress gauge
    this.progressGauge = new ProgressGauge(appContainer);

    // Initialize scale calibrator
    this.scaleCalibrator = new ScaleCalibratorComponent(appContainer, () => {
      // Refresh detection panel when scale changes
      if (this.detectionPanel) {
        this.detectionPanel.refreshDisplay();
      }
    });

    // Setup drag and drop
    this.setupDragAndDrop();

    console.log('FloorIA application initialized successfully');
  }

  /**
   * Handle file upload
   */
  private async handleFileUpload(file: File): Promise<void> {
    try {
      this.header.updateStatus('Analyse en cours...');
      this.detectionPanel.hideError();
      
      // Show modern progress gauge instead of simple loading
      this.progressGauge.show();

      // Load and display the image
      await this.canvas.loadImage(file);

      // Send to backend for analysis
      const analysisResult = await apiClient.analyzeImage(file);

      // Display results
      this.canvas.setAnalysisData(analysisResult);
      this.detectionPanel.setDetections(analysisResult.detections);

      // Complete the progress gauge
      this.progressGauge.complete();

      // Fit image to window initially
      setTimeout(() => {
        this.canvas.getElement().dispatchEvent(new CustomEvent('fit-to-window'));
      }, 100);

      this.header.updateStatus('Analyse terminée');
      
    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.detectionPanel.showError(`Erreur lors du traitement de l'image: ${errorMessage}`);
      this.header.updateStatus('Erreur');
      this.progressGauge.hide();
    }
  }

  /**
   * Handle detection selection
   */
  private handleDetectionSelect(index: number): void {
    this.canvas.selectDetection(index);
  }

  /**
   * Handle opacity change
   */
  private handleOpacityChange(opacity: number): void {
    this.canvas.setBackgroundOpacity(opacity);
  }

  /**
   * Handle reset
   */
  private handleReset(): void {
    this.canvas.reset();
    this.detectionPanel.clear();
    this.header.updateStatus('Prêt');
  }

  /**
   * Setup toolbar to canvas event connections
   */
  private setupToolbarCanvasEvents(): void {
    console.log('🔧 Setting up toolbar canvas events...');
    const toolbarElement = this.toolbar.getElement();
    console.log('🔧 Toolbar element obtained:', toolbarElement);

    // Listen for toolbar zoom events and call canvas methods directly
    toolbarElement.addEventListener('zoom-in', () => {
      this.canvas.zoomIn();
    });

    toolbarElement.addEventListener('zoom-out', () => {
      this.canvas.zoomOut();
    });

    toolbarElement.addEventListener('fit-to-window', () => {
      this.canvas.fitToWindow();
    });

    // Listen for scale calibrator events
    toolbarElement.addEventListener('open-scale-calibrator', () => {
      this.scaleCalibrator.show();
    });

    // Listen for export JSON events
    toolbarElement.addEventListener('export-json', () => {
      console.log('🎯 Export JSON event received!');
      const detections = this.detectionPanel.getDetections();
      console.log('📊 Current detections:', detections.length, 'items');
      
      if (detections.length > 0) {
        console.log('✅ Calling exportDetectionsToJSON with detections');
        exportDetectionsToJSON(detections);
      } else {
        console.log('⚠️ No detections to export');
        alert('Aucune détection à exporter. Veuillez d\'abord analyser une image.');
      }
    });
  }

  /**
   * Setup drag and drop functionality
   */
  private setupDragAndDrop(): void {
    const canvasContainer = this.canvas.getElement();

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      canvasContainer.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    // Highlight drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
      canvasContainer.addEventListener(eventName, () => {
        canvasContainer.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      canvasContainer.addEventListener(eventName, () => {
        canvasContainer.classList.remove('dragover');
      });
    });

    // Handle dropped files
    canvasContainer.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt?.files;

      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          this.handleFileUpload(file);
        } else {
          this.detectionPanel.showError('Veuillez sélectionner un fichier image valide');
        }
      }
    });
  }

  /**
   * Destroy the application
   */
  destroy(): void {
    this.header.destroy();
    this.footer.destroy();
    this.toolbar.destroy();
    this.canvas.destroy();
    this.detectionPanel.destroy();
    this.progressGauge.destroy();
    this.scaleCalibrator.destroy();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    new FloorIAApp();
  } catch (error) {
    console.error('Failed to initialize FloorIA application:', error);
  }
});
