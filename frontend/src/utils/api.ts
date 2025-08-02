// FloorIA API Utilities

import type { AnalysisResult, ModelInfo } from '@/types';
import { AuthManager } from '@/supabaseClient';

const API_BASE_URL = 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;
  private authManager: AuthManager;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.authManager = AuthManager.getInstance();
  }

  /**
   * Check if user is authenticated
   */
  private checkAuthentication(): void {
    if (!this.authManager.isAuthenticated()) {
      throw new Error('Authentication required. Please log in to use this feature.');
    }
  }

  /**
   * Analyze an image using the Roboflow model
   */
  async analyzeImage(file: File): Promise<AnalysisResult> {
    // Check authentication before making request
    this.checkAuthentication();
    
    const formData = new FormData();
    formData.append('image', file);

    const token = this.authManager.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in to analyze images.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get Roboflow model information and metrics
   */
  async getModelInfo(): Promise<ModelInfo> {
    // Check authentication before making request
    this.checkAuthentication();
    
    const token = this.authManager.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/model-info`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in to access model information.');
      }
      throw new Error(`Failed to load model info: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  }
}

// Default API client instance
export const apiClient = new ApiClient();
