// Types for FloorIA Vue.js application

export interface Detection {
  id: string
  class: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
  color?: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface AnalysisResult {
  detections: Detection[]
  image_info: {
    width: number
    height: number
    filename: string
  }
  processing_time: number
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

export interface CalibrationData {
  scale: number
  unit: string
  reference_length: number
}

export interface ExportData {
  image: string
  timestamp: string
  detections: Detection[]
  calibration?: CalibrationData
}
