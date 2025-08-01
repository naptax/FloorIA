// FloorIA Detection Utilities

import type { Detection } from '@/types';

/**
 * Generate a unique ID and short name for a detection
 */
export function generateDetectionIdentifiers(label: string, index: number): { id: string; shortName: string } {
  // Generate a unique ID based on timestamp and index
  const timestamp = Date.now();
  const id = `${label.toLowerCase().replace(/\s+/g, '_')}_${timestamp}_${index}`;
  
  // Generate short name based on element type
  const shortName = generateShortName(label, index);
  
  return { id, shortName };
}

/**
 * Generate a short name for display based on element type
 */
function generateShortName(label: string, index: number): string {
  // Map common architectural elements to short prefixes
  const labelMap: Record<string, string> = {
    'wall': 'W',
    'mur': 'W',
    'door': 'D', 
    'porte': 'D',
    'window': 'F',
    'fenetre': 'F',
    'fenêtre': 'F',
    'room': 'R',
    'piece': 'R',
    'pièce': 'R',
    'salle': 'R',
    'bathroom': 'SDB',
    'kitchen': 'CUI',
    'cuisine': 'CUI',
    'bedroom': 'CH',
    'chambre': 'CH',
    'living': 'SAL',
    'salon': 'SAL',
    'corridor': 'COR',
    'couloir': 'COR',
    'stairs': 'ESC',
    'escalier': 'ESC',
    'balcony': 'BAL',
    'balcon': 'BAL',
    'terrace': 'TER',
    'terrasse': 'TER'
  };

  // Normalize label for lookup
  const normalizedLabel = label.toLowerCase().trim();
  
  // Find matching prefix
  let prefix = 'EL'; // Default prefix for "Element"
  
  for (const [key, value] of Object.entries(labelMap)) {
    if (normalizedLabel.includes(key)) {
      prefix = value;
      break;
    }
  }
  
  // Return short name with incremented index
  return `${prefix}${index + 1}`;
}

/**
 * Enhance detections with permanent IDs and short names
 */
export function enhanceDetections(detections: Omit<Detection, 'id' | 'shortName'>[]): Detection[] {
  return detections.map((detection, index) => {
    const { id, shortName } = generateDetectionIdentifiers(detection.label, index);
    
    return {
      ...detection,
      id,
      shortName
    };
  });
}

/**
 * Get element type color for display
 */
export function getElementTypeColor(label: string): string {
  const normalizedLabel = label.toLowerCase().trim();
  
  // Color mapping for different element types
  if (normalizedLabel.includes('wall') || normalizedLabel.includes('mur')) {
    return '#4fc3f7'; // Blue for walls
  }
  if (normalizedLabel.includes('door') || normalizedLabel.includes('porte')) {
    return '#66bb6a'; // Green for doors
  }
  if (normalizedLabel.includes('window') || normalizedLabel.includes('fenetre') || normalizedLabel.includes('fenêtre')) {
    return '#ffa726'; // Orange for windows
  }
  if (normalizedLabel.includes('room') || normalizedLabel.includes('piece') || normalizedLabel.includes('pièce') || normalizedLabel.includes('salle')) {
    return '#ab47bc'; // Purple for rooms
  }
  
  return '#78909c'; // Default gray
}
