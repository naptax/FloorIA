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
import { authManager, AuthUser } from './supabaseClient';
import { AuthModal } from './AuthModal';
import '@/styles/main.css';
import './auth.css';

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
  private currentImageFilename: string = '';
  private authModal!: AuthModal;
  private currentUser: AuthUser | null = null;

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

    // Initialize authentication first
    this.initializeAuth();

    // Create event handlers for component communication
    const eventHandlers: ComponentEventHandlers = {
      onFileUpload: this.handleFileUpload.bind(this),
      onDetectionSelect: this.handleDetectionSelect.bind(this),
      onOpacityChange: this.handleOpacityChange.bind(this),
      onReset: this.handleReset.bind(this)
    };

    // Initialize components but keep them hidden initially
    this.header = new Header(appContainer);
    this.footer = new Footer(appContainer);

    // Create main workspace
    const mainWorkspace = document.createElement('div');
    mainWorkspace.className = 'main-workspace';
    mainWorkspace.id = 'main-workspace';
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

    // Hide the main interface initially until user is authenticated
    this.hideMainInterface();

    console.log('FloorIA application initialized successfully');
  }

  /**
   * Hide the main application interface
   */
  private hideMainInterface(): void {
    const mainWorkspace = document.getElementById('main-workspace');
    const detectionPanel = document.querySelector('.detection-panel') as HTMLElement;
    const footer = document.querySelector('.footer') as HTMLElement;
    
    if (mainWorkspace) mainWorkspace.style.display = 'none';
    if (detectionPanel) detectionPanel.style.display = 'none';
    if (footer) footer.style.display = 'none';
  }

  /**
   * Show the main application interface
   */
  private showMainInterface(): void {
    const mainWorkspace = document.getElementById('main-workspace');
    const detectionPanel = document.querySelector('.detection-panel') as HTMLElement;
    const footer = document.querySelector('.footer') as HTMLElement;
    
    if (mainWorkspace) mainWorkspace.style.display = 'flex';
    if (detectionPanel) detectionPanel.style.display = 'block';
    if (footer) footer.style.display = 'block';
  }

  /**
   * Handle file upload
   */
  private async handleFileUpload(file: File): Promise<void> {
    try {
      // Store the original filename for later use in export
      this.currentImageFilename = file.name;
      console.log('📁 Image filename stored:', this.currentImageFilename);
      
      this.header.updateStatus('Analyse en cours...');
      this.detectionPanel.hideError();
      
      // Show modern progress gauge instead of simple loading
      this.progressGauge.show();

      // Load and display the image
      await this.canvas.loadImage(file);

      // Send to backend for analysis
      const analysisResult = await apiClient.analyzeImage(file);

      // Check if the response contains an error
      if (analysisResult.status === 'error') {
        throw new Error(analysisResult.message || 'Erreur lors de l\'analyse');
      }

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
   * Handle detection selection - synchronize between Canvas and DetectionPanel
   */
  private handleDetectionSelect(index: number): void {
    console.log('🔄 Main: Synchronizing selection for index:', index);
    
    // Select in canvas (visual highlight)
    this.canvas.selectDetection(index);
    console.log('✅ Main: Canvas selection updated');
    
    // Select in detection panel (table row highlight)
    this.detectionPanel.selectDetectionPublic(index);
    console.log('✅ Main: DetectionPanel selection updated');
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
        // Generate JSON filename based on original image filename
        let jsonFilename = 'flooria-analysis.json';
        if (this.currentImageFilename) {
          // Remove extension from image filename and add .json
          const nameWithoutExt = this.currentImageFilename.replace(/\.[^/.]+$/, '');
          jsonFilename = `${nameWithoutExt}-analysis.json`;
          console.log('📁 Generated JSON filename from image:', jsonFilename);
        }
        
        console.log('✅ Calling exportDetectionsToJSON with detections and filename');
        exportDetectionsToJSON(detections, jsonFilename);
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
   * Initialize authentication system
   */
  private initializeAuth(): void {
    // Initialize auth modal
    this.authModal = new AuthModal((user: AuthUser) => {
      this.handleAuthSuccess(user);
    });

    // Listen for auth state changes
    authManager.onAuthStateChange((user: AuthUser | null) => {
      this.currentUser = user;
      this.updateAuthUI();
    });

    // Check if user is already authenticated
    this.currentUser = authManager.getCurrentUser();
    this.updateAuthUI();
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(user: AuthUser): void {
    console.log('User authenticated:', user);
    this.currentUser = user;
    this.updateAuthUI();
  }

  /**
   * Update the authentication UI elements
   */
  private updateAuthUI(): void {
    if (this.currentUser) {
      // User is authenticated - show main interface
      this.showMainInterface();
      this.addAuthButtonToToolbar();
      console.log('✅ User authenticated - showing main interface');
    } else {
      // User is not authenticated - hide main interface and show login
      this.hideMainInterface();
      this.showAuthModal();
      console.log('❌ User not authenticated - hiding main interface');
    }
  }

  /**
   * Show the authentication modal
   */
  private showAuthModal(): void {
    if (this.authModal) {
      this.authModal.show();
    }
  }

  /**
   * Add authentication button to toolbar
   */
  private addAuthButtonToToolbar(): void {
    const toolbarElement = document.querySelector('.toolbar') as HTMLElement;
    if (!toolbarElement) return;

    // Remove existing auth elements
    const existingAuthElements = toolbarElement.querySelectorAll('.toolbar-auth, .toolbar-user-info');
    existingAuthElements.forEach(el => el.remove());

    if (this.currentUser) {
      // User is authenticated - show user info and logout button
      const userInfo = document.createElement('div');
      userInfo.className = 'toolbar-user-info';
      
      const avatar = document.createElement('div');
      avatar.className = 'toolbar-user-avatar';
      avatar.textContent = this.currentUser.email.charAt(0).toUpperCase();
      
      const userText = document.createElement('span');
      userText.textContent = this.currentUser.full_name || this.currentUser.email;
      
      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'toolbar-logout-btn';
      logoutBtn.textContent = 'Déconnexion';
      logoutBtn.addEventListener('click', () => this.handleLogout());
      
      userInfo.appendChild(avatar);
      userInfo.appendChild(userText);
      userInfo.appendChild(logoutBtn);
      
      toolbarElement.appendChild(userInfo);
    } else {
      // User is not authenticated - show login button
      const loginBtn = document.createElement('button');
      loginBtn.className = 'toolbar-auth-btn';
      loginBtn.textContent = 'Se connecter';
      loginBtn.addEventListener('click', () => this.showAuthModal());
      
      toolbarElement.appendChild(loginBtn);
    }
  }

  /**
   * Handle user logout
   */
  private async handleLogout(): Promise<void> {
    try {
      const result = await authManager.signOut();
      if (result.success) {
        console.log('User logged out successfully');
        this.currentUser = null;
        this.updateAuthUI();
      } else {
        console.error('Logout failed:', result.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
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
