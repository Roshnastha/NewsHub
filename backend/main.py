from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import onnxruntime as ort
import os
from pathlib import Path
import tempfile

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,localhost:3000").split(",")

if ENVIRONMENT == "production":
    ALLOWED_ORIGINS = [
        "https://www.example.com",
        "https://example.com",
    ]
elif ENVIRONMENT == "development":
    ALLOWED_ORIGINS = ["http://localhost:3000", "localhost:3000", "http://localhost:3001", "*"]

app = FastAPI(
    title="Deepfake Detection API",
    description="API for detecting AI-generated vs real videos using ONNX model",
    version="1.0.0"
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
session = None
input_name = None

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    label: str  # "AI-generated" or "Real"
    raw_probability: dict
    logits: list

@app.on_event("startup")
async def load_model():
    """Load the ONNX model on startup"""
    global session, input_name
    try:
        model_path = Path(__file__).parent / "model" / "model_1.onnx"
        
        # Check if model file exists
        if not model_path.exists():
            print(f"\n⚠️  Model not found at {model_path}")
            print("📍 Please place your model_1.onnx file in backend/model/")
            print("✅ Backend will run in DEMO mode without real predictions\n")
            session = None
            return
        
        # Load ONNX model
        session = ort.InferenceSession(str(model_path))
        input_name = session.get_inputs()[0].name
        print(f"\n✅ ONNX Model loaded successfully!")
        print(f"📍 Input name: {input_name}\n")
        
    except Exception as e:
        print(f"\n⚠️  Error loading model: {e}")
        print("✅ Backend will run in DEMO mode\n")
        session = None
        input_name = None

def extract_16_consecutive_frames(video_path):
    """Extract 16 frames from video, padding if necessary"""
    cap = cv2.VideoCapture(video_path)

    mean = np.array([0.485, 0.456, 0.406])
    std  = np.array([0.229, 0.224, 0.225])

    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = cv2.resize(frame, (224, 224))
        frame = frame.astype(np.float32) / 255.0
        frame = (frame - mean) / std
        frames.append(frame)
        if len(frames) == 16:
            break

    cap.release()

    # Fallback to PIL if OpenCV cannot read the GIF
    if len(frames) == 0:
        try:
            from PIL import Image
            with Image.open(video_path) as img:
                for i in range(getattr(img, "n_frames", 1)):
                    img.seek(i)
                    frame = img.convert("RGB")
                    frame = np.array(frame)
                    frame = cv2.resize(frame, (224, 224))
                    frame = frame.astype(np.float32) / 255.0
                    frame = (frame - mean) / std
                    frames.append(frame)
                    if len(frames) == 16:
                        break
        except Exception:
            pass

    if len(frames) == 0:
        raise ValueError("Could not extract any frames from the file.")

    
    if len(frames) < 16:
        original_count = len(frames)
        while len(frames) < 16:
            frames.append(frames[len(frames) % original_count])

    # [16, 224, 224, 3] → [1, 16, 3, 224, 224]
    frames = np.array(frames).transpose(0, 3, 1, 2)
    frames = np.expand_dims(frames, axis=0).astype(np.float32)
    return frames

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": session is not None,
        "service": "Video Deepfake Detection"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict if video is AI-generated or real
    
    Args:
        file: Video file (mp4, avi, mov, etc.)
    
    Returns:
        PredictionResponse with prediction and confidence
    """
    # early sanity checks --------------------------------------------------
    # make sure we got a video
    content_type = file.content_type or ""
    if not (content_type.startswith("video/") or content_type == "image/gif"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a video or GIF")

    # log the filename for easier debugging
    print(f"/predict called with {file.filename} ({content_type})")

    # If model not loaded, use demo mode
    
    
    # Create temp file
    temp_dir = tempfile.gettempdir()
    video_path = os.path.join(temp_dir, f"temp_{file.filename}")
    
    try:
        # Save uploaded file
        with open(video_path, "wb") as f:
            f.write(await file.read())
        
        # Extract frames
        input_tensor = extract_16_consecutive_frames(video_path)
        
        # Run inference
        outputs = session.run(None, {input_name: input_tensor})
        
        # Process results
        logits = np.array(outputs[0])
        probs = np.exp(logits) / np.sum(np.exp(logits), axis=1, keepdims=True)
        predicted_class_index = np.argmax(probs, axis=1)[0]
        confidence = float(probs[0][predicted_class_index])
        
        labels = ["AI", "Real"]
        predicted_label = labels[predicted_class_index]
        
        # Format prediction string
        confidence_percentage = int(confidence * 100)
        prediction_str = f"{confidence_percentage}% {predicted_label}"
        
        return PredictionResponse(
            prediction=prediction_str,
            confidence=confidence,
            label=predicted_label,
            raw_probability={
                "AI": float(probs[0][0]),
                "Real": float(probs[0][1])
            },
            logits=logits.tolist()
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(video_path):
            os.remove(video_path)

@app.get("/info")
async def info():
    """Get API information"""
    return {
        "api_name": "Video Deepfake Detection API",
        "version": "1.0.0",
        "model_loaded": session is not None,
        "model_type": "ONNX",
        "input_format": "[1, 16, 3, 224, 224] - 16 consecutive RGB frames at 224x224",
        "endpoints": {
            "health": "/health (GET)",
            "predict": "/predict (POST) - Upload video file",
            "info": "/info (GET)",
            "docs": "/docs"
        },
        "supported_formats": ["mp4", "avi", "mov", "mkv", "flv", "gif"],
        "classes": ["AI-generated", "Real"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
