from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
import tempfile
from PIL import Image
import io
import base64

from roboflow_client import RoboflowClient
from geometry_processor import GeometryProcessor

# Load environment variables
load_dotenv()

app = FastAPI(title="FloorIA Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
roboflow_client = RoboflowClient()
geometry_processor = GeometryProcessor()

@app.get("/")
async def root():
    return {"message": "FloorIA Backend API", "status": "running"}

@app.get("/model-info")
async def get_model_info():
    """
    Get information about the Roboflow model being used
    """
    try:
        model_info = {
            "model_name": "CubicASA5K-2",
            "project": os.getenv("ROBOFLOW_PROJECT", "cubicasa5k-2-qpmsa-tppfc"),
            "version": os.getenv("ROBOFLOW_VERSION", "1"),
            "workspace": os.getenv("ROBOFLOW_WORKSPACE", "wall-segmentation-pj9zt"),
            "description": "Architectural Element Detection",
            "dataset_size": "4,978 images",
            "metrics": {
                "mAP": "87.3%",
                "precision": "89.1%", 
                "recall": "85.7%"
            },
            "classes": ["wall", "door", "window", "room", "opening"],
            "url": f"https://universe.roboflow.com/wall-segmentation-pj9zt/{os.getenv('ROBOFLOW_PROJECT', 'cubicasa5k-2-qpmsa-tppfc')}/model/{os.getenv('ROBOFLOW_VERSION', '1')}"
        }
        return model_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving model info: {str(e)}")

@app.post("/analyze")
async def analyze_image(image: UploadFile = File(...)):
    """
    Analyze an uploaded image using Roboflow API and process geometries with Shapely
    """
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await image.read()
        
        # Validate image can be opened
        try:
            pil_image = Image.open(io.BytesIO(image_data))
            image_width, image_height = pil_image.size
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        # Save temporary file for Roboflow API
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_data)
            temp_file_path = temp_file.name
        
        try:
            # Call Roboflow API
            print(f"Calling Roboflow API for image: {temp_file_path}")
            roboflow_response = await roboflow_client.infer_image(temp_file_path)
            print(f"Roboflow response received: {type(roboflow_response)}")
            
            # Process geometries with Shapely
            print(f"Processing detections with Shapely...")
            processed_detections = geometry_processor.process_detections(
                roboflow_response, 
                image_width, 
                image_height
            )
            print(f"Processed {len(processed_detections)} detections")
            
            # Prepare response
            response_data = {
                "status": "success",
                "image_dimensions": {
                    "width": image_width,
                    "height": image_height
                },
                "detections": processed_detections,
                "raw_roboflow_response": roboflow_response
            }
            
            return JSONResponse(content=response_data)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in analyze_image: {str(e)}")
        print(f"ERROR type: {type(e)}")
        import traceback
        print(f"ERROR traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "vectorizator-backend"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
