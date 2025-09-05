// FloorIA TypeScript Type Definitions

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Geometry {
  area: number;
  perimeter: number;
}

export interface Detection {
  id: string;           // Identifiant unique permanent
  shortName: string;    // Nom court pour l'affichage (ex: "W1", "D2", "R3")
  bbox: BoundingBox;
  label: string;
  confidence: number;
  geometry?: Geometry;
}

export interface AnalysisResult {
  status?: string;
  message?: string;
  error_type?: string;
  detections: Detection[];
  image_size: {
    width: number;
    height: number;
  };
  processing_time: number;
}

export interface ModelMetrics {
  mAP: string;
  precision: string;
  recall: string;
}

export interface ModelInfo {
  model_name: string;
  project: string;
  workspace: string;
  version: string;
  dataset_size: string;
  description: string;
  classes: string[];
  metrics: ModelMetrics;
  url?: string;
}

export interface CanvasTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface ImageAnalyzerState {
  originalImage: HTMLImageElement | null;
  analysisData: AnalysisResult | null;
  backgroundOpacity: number;
  selectedDetectionIndex: number;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  originalDetections: Detection[] | null;
}

export type SortKey = 'index' | 'label' | 'confidence' | 'area' | 'perimeter';

export interface ComponentEventHandlers {
  onFileUpload?: (file: File) => void;
  onDetectionSelect?: (index: number) => void;
  onZoomChange?: (scale: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onReset?: () => void;
  onSort?: (key: SortKey, direction: 'asc' | 'desc') => void;
  onVisibilityChange?: (visibleDetectionIds: string[]) => void;
}
