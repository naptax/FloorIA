import type { Detection } from '@/types';
import { ScaleCalibrator, formatMeasurement, formatArea, formatDimensions } from './scale';

export interface ExportData {
  metadata: {
    exportDate: string;
    projectName: string;
    scaleCalibration: {
      scale: number;
      isCalibrated: boolean;
      unit: string;
    };
    totalDetections: number;
    analysisTimestamp?: string;
  };
  detections: ExportDetection[];
  summary: {
    elementTypes: Record<string, number>;
    totalArea: string;
    averageConfidence: number;
  };
}

export interface ExportDetection {
  elementId: string;
  shortName: string;
  type: string;
  confidence: number;
  position: {
    x: number;
    y: number;
    xFormatted: string;
    yFormatted: string;
  };
  dimensions: {
    width: number;
    height: number;
    formatted: string;
  };
  geometry: {
    area: number;
    areaFormatted: string;
    perimeter: number;
    perimeterFormatted: string;
  };
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Export detection data to JSON format
 */
export function exportDetectionsToJSON(detections: Detection[], filename?: string): void {
  const scaleCalibrator = ScaleCalibrator.getInstance();
  const exportData = createExportData(detections, scaleCalibrator);
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `flooria-analysis-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Create structured export data
 */
function createExportData(detections: Detection[], scaleCalibrator: any): ExportData {
  const exportDetections: ExportDetection[] = detections.map(detection => ({
    elementId: detection.id || 'unknown',
    shortName: detection.shortName || 'Unknown',
    type: detection.label,
    confidence: Math.round(detection.confidence * 100) / 100,
    position: {
      x: detection.bbox.x,
      y: detection.bbox.y,
      xFormatted: formatMeasurement(detection.bbox.x),
      yFormatted: formatMeasurement(detection.bbox.y)
    },
    dimensions: {
      width: detection.bbox.width,
      height: detection.bbox.height,
      formatted: formatDimensions(detection.bbox.width, detection.bbox.height)
    },
    geometry: {
      area: detection.geometry?.area || 0,
      areaFormatted: detection.geometry ? formatArea(detection.geometry.area) : 'N/A',
      perimeter: detection.geometry?.perimeter || 0,
      perimeterFormatted: detection.geometry ? formatMeasurement(detection.geometry.perimeter) : 'N/A'
    },
    bbox: {
      x: detection.bbox.x,
      y: detection.bbox.y,
      width: detection.bbox.width,
      height: detection.bbox.height
    }
  }));

  // Calculate summary statistics
  const elementTypes: Record<string, number> = {};
  let totalArea = 0;
  let totalConfidence = 0;

  exportDetections.forEach(detection => {
    elementTypes[detection.type] = (elementTypes[detection.type] || 0) + 1;
    totalArea += detection.geometry.area;
    totalConfidence += detection.confidence;
  });

  const averageConfidence = detections.length > 0 ? totalConfidence / detections.length : 0;

  return {
    metadata: {
      exportDate: new Date().toISOString(),
      projectName: 'FloorIA Analysis',
      scaleCalibration: {
        scale: scaleCalibrator.getScale(),
        isCalibrated: scaleCalibrator.isCalibrated(),
        unit: scaleCalibrator.isCalibrated() ? 'meters' : 'pixels'
      },
      totalDetections: detections.length,
      analysisTimestamp: new Date().toISOString()
    },
    detections: exportDetections,
    summary: {
      elementTypes,
      totalArea: formatArea(totalArea),
      averageConfidence: Math.round(averageConfidence * 100) / 100
    }
  };
}

/**
 * Copy export data to clipboard
 */
export async function copyExportToClipboard(detections: Detection[]): Promise<void> {
  const scaleCalibrator = ScaleCalibrator.getInstance();
  const exportData = createExportData(detections, scaleCalibrator);
  const jsonString = JSON.stringify(exportData, null, 2);
  
  try {
    await navigator.clipboard.writeText(jsonString);
    console.log('Export data copied to clipboard');
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    throw err;
  }
}
