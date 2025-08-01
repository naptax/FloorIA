// FloorIA API Utilities

import type { AnalysisResult, ModelInfo } from '@/types';

const API_BASE_URL = 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Analyze an image using the Roboflow model
   */
  async analyzeImage(file: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get Roboflow model information and metrics
   */
  async getModelInfo(): Promise<ModelInfo> {
    const response = await fetch(`${this.baseUrl}/model-info`);

    if (!response.ok) {
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
