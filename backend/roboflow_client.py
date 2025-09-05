from roboflow import Roboflow
import os
import asyncio
from typing import Dict, Any
import json

class RoboflowClient:
    """
    Client for interacting with Roboflow API using the official roboflow package
    """
    
    def __init__(self):
        # Load configuration from environment variables for security
        self.api_key = os.getenv("ROBOFLOW_API_KEY")
        self.workspace = os.getenv("ROBOFLOW_WORKSPACE", "cubicasa5k-2-qpmsa-tppfc")
        self.project_name = os.getenv("ROBOFLOW_PROJECT", "cubicasa5k-2-qpmsa-tppfc")
        self.version = int(os.getenv("ROBOFLOW_VERSION", "1"))
        
        # Validate required environment variables
        if not self.api_key:
            print("WARNING: ROBOFLOW_API_KEY not found in environment variables")
            print("Please set your Roboflow API key in the .env file")
        
        # Initialize Roboflow with error handling
        try:
            self.rf = Roboflow(api_key=self.api_key)
            self.project = self.rf.workspace().project(self.project_name)
            self.model = self.project.version(self.version).model
            self.initialized = True
            print(f"Roboflow client initialized successfully for project: {self.project_name}")
        except Exception as e:
            print(f"Failed to initialize Roboflow client: {e}")
            self.initialized = False
            self.rf = None
            self.project = None
            self.model = None
    
    async def infer_image(self, image_path: str) -> Dict[Any, Any]:
        """
        Submit an image to Roboflow API for inference using the roboflow package
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dict containing the API response with bounding box coordinates
        """
        
        # Check if Roboflow client was initialized successfully
        if not self.initialized or self.model is None:
            raise Exception(
                "Configuration Roboflow manquante ou invalide. "
                "Vérifiez que ROBOFLOW_API_KEY est défini dans le fichier .env "
                "et que votre compte Roboflow est actif."
            )
        
        try:
            # Use the roboflow package to call the API
            # Run the synchronous model.predict call in a thread pool to make it async
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self.model.predict, 
                image_path
            )
            
            # Convert the result to a dictionary if it's not already
            if hasattr(result, 'json'):
                return result.json()
            elif hasattr(result, '__dict__'):
                return result.__dict__
            else:
                return result
            
        except Exception as e:
            print(f"Error calling Roboflow API: {e}")
            # Instead of falling back to mock data, raise a clear error
            if "403" in str(e) or "Forbidden" in str(e):
                raise Exception(
                    "Erreur d'authentification Roboflow (403 Forbidden). "
                    "Vérifiez votre clé API Roboflow, les permissions du projet, "
                    "ou le quota de votre compte sur roboflow.com"
                )
            elif "401" in str(e) or "Unauthorized" in str(e):
                raise Exception(
                    "Clé API Roboflow invalide (401 Unauthorized). "
                    "Vérifiez votre ROBOFLOW_API_KEY dans le fichier .env"
                )
            elif "404" in str(e) or "Not Found" in str(e):
                raise Exception(
                    "Projet Roboflow introuvable (404 Not Found). "
                    "Vérifiez le nom du projet et de l'espace de travail dans le fichier .env"
                )
            else:
                raise Exception(f"Erreur de l'API Roboflow: {str(e)}")
    
    def _get_mock_response(self) -> Dict[Any, Any]:
        """
        Mock response for testing purposes - matches Roboflow response format
        """
        return {
            "predictions": [
                {
                    "x": 320.5,
                    "y": 240.5,
                    "width": 150.0,
                    "height": 100.0,
                    "confidence": 0.85,
                    "class": "room",
                    "class_id": 0
                },
                {
                    "x": 500.0,
                    "y": 300.0,
                    "width": 80.0,
                    "height": 120.0,
                    "confidence": 0.72,
                    "class": "door",
                    "class_id": 1
                },
                {
                    "x": 150.0,
                    "y": 180.0,
                    "width": 60.0,
                    "height": 40.0,
                    "confidence": 0.68,
                    "class": "window",
                    "class_id": 2
                }
            ],
            "image": {
                "width": 640,
                "height": 480
            }
        }
