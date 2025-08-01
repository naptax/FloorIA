from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union
from typing import List, Dict, Any, Tuple
import json

class GeometryProcessor:
    """
    Process geometric data using Shapely library
    """
    
    def __init__(self):
        pass
    
    def process_detections(self, roboflow_response: Dict[Any, Any], image_width: int, image_height: int) -> List[Dict[str, Any]]:
        """
        Process Roboflow API response and convert bounding boxes to geometric objects
        
        Args:
            roboflow_response: Raw response from Roboflow API
            image_width: Original image width
            image_height: Original image height
            
        Returns:
            List of processed detection objects with geometric information
        """
        processed_detections = []
        
        # Extract predictions from Roboflow response
        predictions = roboflow_response.get('predictions', [])
        
        for prediction in predictions:
            # Extract bounding box coordinates
            # Roboflow typically returns center coordinates + width/height
            center_x = prediction.get('x', 0)
            center_y = prediction.get('y', 0)
            width = prediction.get('width', 0)
            height = prediction.get('height', 0)
            
            # Convert to corner coordinates
            bbox_coords = self._center_to_corners(center_x, center_y, width, height)
            
            # Create Shapely geometry objects
            bbox_polygon = self._create_bbox_polygon(bbox_coords)
            
            # Calculate additional geometric properties
            area = bbox_polygon.area
            perimeter = bbox_polygon.length
            centroid = bbox_polygon.centroid
            
            # Prepare processed detection object
            processed_detection = {
                'label': prediction.get('class', 'unknown'),
                'confidence': prediction.get('confidence', 0.0),
                'class_id': prediction.get('class_id', -1),
                'bbox': {
                    'x': bbox_coords['x'],
                    'y': bbox_coords['y'],
                    'width': bbox_coords['width'],
                    'height': bbox_coords['height']
                },
                'geometry': {
                    'area': area,
                    'perimeter': perimeter,
                    'centroid': {
                        'x': centroid.x,
                        'y': centroid.y
                    },
                    'corners': self._get_polygon_corners(bbox_polygon)
                },
                'shapely_polygon': bbox_polygon  # This won't be JSON serializable, but useful for further processing
            }
            
            processed_detections.append(processed_detection)
        
        # Calculate overlaps and intersections
        processed_detections = self._calculate_overlaps(processed_detections)
        
        return processed_detections
    
    def _center_to_corners(self, center_x: float, center_y: float, width: float, height: float) -> Dict[str, float]:
        """
        Convert center coordinates + dimensions to corner coordinates
        """
        x = center_x - width / 2
        y = center_y - height / 2
        
        return {
            'x': x,
            'y': y,
            'width': width,
            'height': height
        }
    
    def _create_bbox_polygon(self, bbox_coords: Dict[str, float]) -> Polygon:
        """
        Create a Shapely Polygon from bounding box coordinates
        """
        x = bbox_coords['x']
        y = bbox_coords['y']
        width = bbox_coords['width']
        height = bbox_coords['height']
        
        # Create polygon from corner coordinates
        return box(x, y, x + width, y + height)
    
    def _get_polygon_corners(self, polygon: Polygon) -> List[Dict[str, float]]:
        """
        Extract corner coordinates from a Shapely polygon
        """
        coords = list(polygon.exterior.coords)
        corners = []
        
        for coord in coords[:-1]:  # Exclude the duplicate last coordinate
            corners.append({
                'x': coord[0],
                'y': coord[1]
            })
        
        return corners
    
    def _calculate_overlaps(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculate overlaps and intersections between detected objects
        """
        for i, detection in enumerate(detections):
            overlaps = []
            
            for j, other_detection in enumerate(detections):
                if i != j:
                    # Recreate polygons from bbox data
                    bbox1 = detection['bbox']
                    bbox2 = other_detection['bbox']
                    
                    polygon1 = box(
                        bbox1['x'], 
                        bbox1['y'], 
                        bbox1['x'] + bbox1['width'], 
                        bbox1['y'] + bbox1['height']
                    )
                    polygon2 = box(
                        bbox2['x'], 
                        bbox2['y'], 
                        bbox2['x'] + bbox2['width'], 
                        bbox2['y'] + bbox2['height']
                    )
                    
                    if polygon1.intersects(polygon2):
                        intersection = polygon1.intersection(polygon2)
                        overlap_area = intersection.area
                        overlap_ratio = overlap_area / polygon1.area
                        
                        overlaps.append({
                            'detection_index': j,
                            'overlap_area': overlap_area,
                            'overlap_ratio': overlap_ratio,
                            'other_label': other_detection['label']
                        })
            
            detection['overlaps'] = overlaps
            
            # Remove the shapely_polygon before JSON serialization
            if 'shapely_polygon' in detection:
                del detection['shapely_polygon']
        
        return detections
    
    def create_combined_geometry(self, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create combined geometric analysis of all detections
        """
        if not detections:
            return {}
        
        # Recreate polygons for analysis
        polygons = []
        for detection in detections:
            bbox = detection['bbox']
            polygon = box(
                bbox['x'], 
                bbox['y'], 
                bbox['x'] + bbox['width'], 
                bbox['y'] + bbox['height']
            )
            polygons.append(polygon)
        
        # Calculate combined metrics
        total_area = sum(p.area for p in polygons)
        union_geometry = unary_union(polygons)
        union_area = union_geometry.area
        coverage_efficiency = union_area / total_area if total_area > 0 else 0
        
        return {
            'total_detections': len(detections),
            'total_area': total_area,
            'union_area': union_area,
            'coverage_efficiency': coverage_efficiency,
            'union_bounds': list(union_geometry.bounds) if hasattr(union_geometry, 'bounds') else []
        }
