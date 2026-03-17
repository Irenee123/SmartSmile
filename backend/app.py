from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError
import uvicorn
from model_loader import get_model_loader
from inference import OralDiseasePredictor
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# === HEATMAP VERSION 2.0 - PLEASE RELOAD ===

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase JWT Secret - get from environment or use default for development
SUPABASE_JWT_SECRET = os.environ.get('SUPABASE_JWT_SECRET', '')

# Security scheme
security = HTTPBearer()

# Initialize FastAPI app
app = FastAPI(
    title="Oral Disease Classification API",
    description="API for classifying oral diseases using EfficientViT model",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global predictor instance
predictor = None

# Request model
class PredictionRequest(BaseModel):
    image: str  # Base64 encoded image


# ============================================
# Authentication Functions
# ============================================

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Decodes the JWT token and returns the user_id
    """
    if not SUPABASE_JWT_SECRET:
        logger.warning("SUPABASE_JWT_SECRET not set - authentication disabled for development")
        return "development_user"
    
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Supabase doesn't use audience
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user ID"
            )
        return user_id
    except JWTError as e:
        logger.error(f"JWT Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


def get_admin_user(user_id: str = Depends(get_current_user)):
    """
    Checks that the current user is in the admins table
    Note: This requires Supabase client to be configured
    """
    # For now, return the user_id - admin check can be added later with Supabase table
    return user_id


@app.on_event("startup")
async def startup_event():
    """
    Load the model when the server starts
    """
    global predictor
    try:
        logger.info("Starting up server...")
        logger.info("Loading model...")
        
        # Load model
        model_loader = get_model_loader()
        model = model_loader.get_model()
        device = model_loader.get_device()
        class_labels = model_loader.get_class_labels()
        
        # Initialize predictor
        predictor = OralDiseasePredictor(model, device, class_labels)
        
        logger.info(f"Model loaded successfully on {device}")
        logger.info(f"Classes: {class_labels}")
        logger.info("Server ready to accept requests")
        
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise


@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return JSONResponse(content={
        "message": "Oral Disease Classification API",
        "version": "1.0.0",
        "status": "running",
        "health_endpoint": "/health",
        "predict_endpoint": "/predict"
    })


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    global predictor
    
    if predictor is None:
        return JSONResponse(content={
            "status": "unhealthy",
            "model_loaded": False,
            "device": "unknown",
            "classes": []
        })
    
    return JSONResponse(content={
        "status": "healthy",
        "model_loaded": True,
        "device": str(predictor.device),
        "classes": predictor.class_labels
    })


# Debug endpoint to check heatmap availability
@app.get("/debug/heatmap-status")
async def heatmap_status():
    """Debug endpoint to check if heatmap code is available"""
    has_method = hasattr(predictor, 'generate_heatmap') if predictor else False
    return {
        "predictor_exists": predictor is not None,
        "has_generate_heatmap": has_method,
        "message": "Heatmap code is ACTIVE" if has_method else "Heatmap code NOT FOUND"
    }


@app.post("/predict")
async def predict(request: PredictionRequest, user_id: str = Depends(get_current_user)):
    """
    Predict oral disease from base64 encoded image
    Requires authentication via JWT token
    """
    global predictor
    
    try:
        # Check if predictor is initialized
        if predictor is None:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please try again later."
            )
        
        # Validate image data
        if not request.image:
            raise HTTPException(
                status_code=400,
                detail="No image data provided"
            )
        
        logger.info("Received prediction request")
        
        # Perform prediction
        result = predictor.predict_from_base64(request.image)
        
        # Generate heatmap (optional, in background)
        heatmap_result = None
        try:
            logger.info("=== Generating heatmap... ===")
            heatmap_result = predictor.generate_heatmap(request.image)
            if heatmap_result.get('success'):
                logger.info("=== Heatmap generated successfully ===")
            else:
                logger.warning(f"=== Heatmap generation failed: {heatmap_result.get('error')} ===")
        except Exception as e:
            logger.warning(f"=== Heatmap generation error: {str(e)} ===")
        
        logger.info(f"Prediction: {result['prediction']} (confidence: {result['confidence_percentage']:.2f}%)")
        
        # Return response as JSONResponse
        response_data = {
            "success": True,
            "prediction": result['prediction'],
            "confidence": result['confidence'],
            "confidence_percentage": result['confidence_percentage'],
            "all_scores": result['all_scores'],
            "top_predictions": result['top_predictions'],
            "device_used": result['device_used'],
            "message": "Prediction successful"
        }
        
        # Add heatmap if available
        if heatmap_result and heatmap_result.get('success'):
            response_data['heatmap_image'] = heatmap_result['heatmap_image']
        
        return JSONResponse(content=response_data)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
        
    except RuntimeError as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )


# ============================================
# Email API Endpoints
# ============================================

from email_service import (
    send_welcome_email,
    send_password_reset_email,
    send_password_changed_email,
    send_email_verification,
    send_screening_result_email,
    get_email_credentials
)

class EmailRequest(BaseModel):
    to_email: str
    user_name: str
    link: str = None  # For password reset/verification links
    result_data: dict = None  # For screening results

@app.get("/email/test-credentials")
async def test_email_credentials():
    """Test if email credentials are configured"""
    creds = get_email_credentials()
    return {
        "configured": bool(creds['username'] and creds['password']),
        "from_name": creds['from_name'],
        "from_email": creds['from_email']
    }


@app.post("/email/send-welcome")
async def send_welcome(request: EmailRequest):
    """Send welcome email to new user"""
    try:
        success = send_welcome_email(request.to_email, request.user_name)
        if success:
            return {"success": True, "message": "Welcome email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send welcome email")
    except Exception as e:
        logger.error(f"Error sending welcome email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/email/send-password-reset")
async def send_password_reset(request: EmailRequest):
    """Send password reset email"""
    try:
        if not request.link:
            raise HTTPException(status_code=400, detail="Reset link is required")
        success = send_password_reset_email(request.to_email, request.user_name, request.link)
        if success:
            return {"success": True, "message": "Password reset email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send password reset email")
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/email/send-password-changed")
async def send_password_changed(request: EmailRequest):
    """Send password changed confirmation"""
    try:
        success = send_password_changed_email(request.to_email, request.user_name)
        if success:
            return {"success": True, "message": "Password changed confirmation sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send confirmation email")
    except Exception as e:
        logger.error(f"Error sending password changed email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/email/send-verification")
async def send_verification(request: EmailRequest):
    """Send email verification"""
    try:
        if not request.link:
            raise HTTPException(status_code=400, detail="Verification link is required")
        success = send_email_verification(request.to_email, request.user_name, request.link)
        if success:
            return {"success": True, "message": "Verification email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send verification email")
    except Exception as e:
        logger.error(f"Error sending verification email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/email/send-screening-result")
async def send_screening_result(request: EmailRequest):
    """Send screening result notification"""
    try:
        if not request.result_data:
            raise HTTPException(status_code=400, detail="Result data is required")
        success = send_screening_result_email(request.to_email, request.user_name, request.result_data)
        if success:
            return {"success": True, "message": "Screening result email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send screening result email")
    except Exception as e:
        logger.error(f"Error sending screening result email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Run the server
    logger.info("Starting Oral Disease Classification API server...")
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=7860,
        reload=False,
        log_level="info"
    )
