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
from pdf2image import convert_from_path
import mimetypes

from roboflow_client import RoboflowClient
from geometry_processor import GeometryProcessor
from auth_middleware import get_current_user, get_current_user_optional, require_auth
from supabase_client import SupabaseAuth

# Load environment variables
load_dotenv()

# Pydantic models for authentication
class LoginRequest(BaseModel):
    email: str
    password: str

class UserUpdateRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserCreateRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "user"

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
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://flooria-aenm.onrender.com"  # Production frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
roboflow_client = RoboflowClient()
geometry_processor = GeometryProcessor()
supabase_auth = SupabaseAuth()

# Admin role checking function
def require_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Dependency to ensure the current user has admin role
    """
    user_profile = supabase_auth.get_user_profile(user['id'])
    if not user_profile or user_profile.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

@app.get("/")
async def root():
    return {"message": "FloorIA Backend API", "status": "running"}

@app.get("/model-info")
async def get_model_info(user: Dict[str, Any] = Depends(get_current_user)):
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
async def analyze_image(image: UploadFile = File(...), user: Dict[str, Any] = Depends(get_current_user)):
    """
    Analyze an uploaded image using Roboflow API and process geometries with Shapely
    """
    try:
        print(f"🔍 ANALYZE REQUEST START - User: {user['email']} (ID: {user['id']})")
        print(f"🔍 Image filename: {image.filename}, content_type: {image.content_type}")
        
        # Validate file type (accept images and PDFs)
        accepted_types = ['image/', 'application/pdf']
        if not any(image.content_type.startswith(t) for t in accepted_types):
            print(f"❌ Invalid content type: {image.content_type}")
            raise HTTPException(status_code=400, detail="File must be an image or PDF")
        
        # Read file data
        file_data = await image.read()
        print(f"🔍 File data size: {len(file_data)} bytes")
        
        # Handle PDF conversion or direct image processing
        if image.content_type == 'application/pdf' or image.filename.lower().endswith('.pdf'):
            print(f"📄 Processing PDF file...")
            try:
                # Save PDF to temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as pdf_temp:
                    pdf_temp.write(file_data)
                    pdf_temp_path = pdf_temp.name
                
                # Convert PDF to images (take first page)
                print(f"🔄 Converting PDF to image...")
                images = convert_from_path(pdf_temp_path, first_page=1, last_page=1, dpi=200)
                
                if not images:
                    raise HTTPException(status_code=400, detail="Could not convert PDF to image")
                
                # Get the first page as PIL Image
                pil_image = images[0]
                image_width, image_height = pil_image.size
                print(f"🔍 PDF converted to image dimensions: {image_width}x{image_height}")
                
                # Save converted image to temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    pil_image.save(temp_file, format='JPEG', quality=95)
                    temp_file_path = temp_file.name
                
                # Clean up PDF temp file
                os.unlink(pdf_temp_path)
                
            except Exception as e:
                print(f"❌ PDF conversion error: {str(e)}")
                if 'pdf_temp_path' in locals() and os.path.exists(pdf_temp_path):
                    os.unlink(pdf_temp_path)
                
                # Provide user-friendly error messages
                error_msg = str(e).lower()
                if "poppler" in error_msg or "pdftoppm" in error_msg:
                    detail = "PDF conversion failed: poppler-utils not installed on server. Please contact administrator."
                elif "permission" in error_msg:
                    detail = "PDF conversion failed: file permission error. Please try a different PDF."
                elif "corrupt" in error_msg or "invalid" in error_msg:
                    detail = "PDF conversion failed: file appears to be corrupted or invalid. Please try a different PDF."
                else:
                    detail = f"PDF conversion failed: {str(e)}. Please try with a PNG/JPG image instead."
                
                raise HTTPException(status_code=400, detail=detail)
        else:
            print(f"🖼️ Processing image file...")
            # Validate image can be opened
            try:
                pil_image = Image.open(io.BytesIO(file_data))
                image_width, image_height = pil_image.size
                print(f"🔍 Image dimensions: {image_width}x{image_height}")
            except Exception as e:
                print(f"❌ Invalid image file: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
            
            # Save image to temporary file for Roboflow API
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(file_data)
                temp_file_path = temp_file.name
        
        print(f"🔍 Temporary file created: {temp_file_path}")
        
        try:
            # Call Roboflow API
            print(f"🤖 Calling Roboflow API...")
            print(f"🔍 Roboflow client initialized: {roboflow_client.initialized}")
            print(f"🔍 Roboflow model available: {roboflow_client.model is not None}")
            
            roboflow_response = await roboflow_client.infer_image(temp_file_path)
            print(f"✅ Roboflow response received: {type(roboflow_response)}")
            print(f"🔍 Response keys: {list(roboflow_response.keys()) if isinstance(roboflow_response, dict) else 'Not a dict'}")
            
            # Process geometries with Shapely
            print(f"⚙️ Processing detections with Shapely...")
            processed_detections = geometry_processor.process_detections(
                roboflow_response, 
                image_width, 
                image_height
            )
            print(f"✅ Processed {len(processed_detections)} detections")
            
            # Prepare response with image data for PDF files
            response_data = {
                "status": "success",
                "image_dimensions": {
                    "width": image_width,
                    "height": image_height
                },
                "detections": processed_detections,
                "raw_roboflow_response": roboflow_response
            }
            
            # For PDF files, include the converted image as base64
            if image.content_type == 'application/pdf' or image.filename.lower().endswith('.pdf'):
                print(f"📄 Adding converted image to response for PDF file...")
                try:
                    # Convert PIL image to base64
                    img_buffer = io.BytesIO()
                    pil_image.save(img_buffer, format='JPEG', quality=95)
                    img_buffer.seek(0)
                    img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                    response_data["converted_image"] = f"data:image/jpeg;base64,{img_base64}"
                    print(f"✅ Converted image added to response (size: {len(img_base64)} chars)")
                except Exception as e:
                    print(f"⚠️ Failed to add converted image to response: {str(e)}")
                    # Continue without the converted image
            
            print(f"🎉 ANALYZE REQUEST SUCCESS - Returning {len(processed_detections)} detections")
            return JSONResponse(content=response_data)
            
        except Exception as roboflow_error:
            # Handle Roboflow-specific errors with clear user messages
            error_message = str(roboflow_error)
            print(f"❌ Roboflow error: {error_message}")
            print(f"❌ Error type: {type(roboflow_error)}")
            import traceback
            print(f"❌ Error traceback: {traceback.format_exc()}")
            
            # Return a structured error response for the frontend
            error_response = {
                "status": "error",
                "error_type": "roboflow_api_error",
                "message": error_message,
                "image_dimensions": {
                    "width": image_width,
                    "height": image_height
                },
                "detections": []
            }
            
            print(f"💥 ANALYZE REQUEST FAILED - Returning error response")
            return JSONResponse(content=error_response, status_code=422)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                print(f"🗑️ Temporary file cleaned up: {temp_file_path}")
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 CRITICAL ERROR in analyze_image: {str(e)}")
        print(f"💥 ERROR type: {type(e)}")
        import traceback
        print(f"💥 ERROR traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "vectorizator-backend"}

@app.get("/debug/roboflow")
async def debug_roboflow():
    """Debug endpoint to check Roboflow configuration"""
    try:
        # Check environment variables
        api_key = os.getenv("ROBOFLOW_API_KEY")
        workspace = os.getenv("ROBOFLOW_WORKSPACE", "cubicasa5k-2-qpmsa-tppfc")
        project = os.getenv("ROBOFLOW_PROJECT", "cubicasa5k-2-qpmsa-tppfc")
        version = os.getenv("ROBOFLOW_VERSION", "1")
        
        # Check if Roboflow client is initialized
        roboflow_status = {
            "api_key_present": bool(api_key),
            "api_key_length": len(api_key) if api_key else 0,
            "workspace": workspace,
            "project": project,
            "version": version,
            "client_initialized": roboflow_client.initialized,
            "model_available": roboflow_client.model is not None
        }
        
        return {
            "status": "debug_info",
            "roboflow": roboflow_status,
            "environment": "production" if os.getenv("NODE_ENV") == "production" else "development"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "roboflow_initialized": False
        }

# Authentication endpoints
@app.post("/auth/signup")
async def signup(signup_data: SignupRequest):
    """
    Public signup is disabled for security reasons.
    Users must be created by administrators through the Supabase dashboard.
    See SUPABASE_ADMIN.md for account creation procedures.
    """
    raise HTTPException(
        status_code=403, 
        detail="Public registration is disabled. Contact your administrator to create an account."
    )

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
