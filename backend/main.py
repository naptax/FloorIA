from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
import tempfile
from PIL import Image
import io
import base64
from typing import Optional, Dict, Any

from roboflow_client import RoboflowClient
from geometry_processor import GeometryProcessor
from auth_middleware import get_current_user, get_current_user_optional, require_auth
from supabase_client import supabase_auth

# Load environment variables
load_dotenv()

# Pydantic models for authentication
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: Optional[str] = None

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

# Authentication endpoints
@app.post("/auth/signup")
async def signup(signup_data: SignupRequest):
    """
    Register a new user with Supabase
    """
    try:
        response = supabase_auth.client.auth.sign_up({
            "email": signup_data.email,
            "password": signup_data.password,
            "options": {
                "data": {
                    "full_name": signup_data.full_name
                }
            }
        })
        
        if response.user:
            # Create user profile
            profile_created = supabase_auth.create_user_profile(
                response.user.id,
                response.user.email,
                {"full_name": signup_data.full_name}
            )
            
            return {
                "status": "success",
                "message": "User created successfully. Please check your email for verification.",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "email_confirmed_at": response.user.email_confirmed_at
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create user")
            
    except Exception as e:
        print(f"Signup error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
async def login(login_data: LoginRequest):
    """
    Login user with Supabase
    """
    try:
        response = supabase_auth.client.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })
        
        if response.user and response.session:
            return {
                "status": "success",
                "message": "Login successful",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "full_name": response.user.user_metadata.get("full_name")
                },
                "session": {
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token,
                    "expires_at": response.session.expires_at
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

@app.post("/auth/logout")
async def logout(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Logout current user
    """
    try:
        # Note: Supabase handles token invalidation on the client side
        # This endpoint mainly serves to confirm the logout action
        return {
            "status": "success",
            "message": "Logout successful"
        }
    except Exception as e:
        print(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")

@app.get("/auth/me")
async def get_current_user_info(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get current user information
    """
    try:
        # Get additional profile information
        profile = supabase_auth.get_user_profile(user["id"])
        
        user_info = {
            "id": user["id"],
            "email": user["email"],
            "user_metadata": user.get("user_metadata", {}),
            "profile": profile
        }
        
        return {
            "status": "success",
            "user": user_info
        }
    except Exception as e:
        print(f"Get user info error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user information")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
