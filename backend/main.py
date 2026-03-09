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
        model_path = Path(__file__).parent / "model" / "model.onnx"
        
        # Check if model file exists
        if not model_path.exists():
            print(f"\n⚠️  Model not found at {model_path}")
            print("📍 Please place your model.onnx file in backend/model/")
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
    """Extract first 16 consecutive frames from video"""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames < 16:
        raise ValueError("Video too short - needs at least 16 frames")

    # Pick the first 16 consecutive frames
    start_idx = 0
    end_idx = start_idx + 16

    frames = []
    for i in range(total_frames):
        ret, frame = cap.read()
        if not ret:
            break
        if start_idx <= i < end_idx:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (224, 224))
            frame = frame.astype(np.float32) / 255.0
            frames.append(frame)

    cap.release()

    # [16, 224, 224, 3] → [1, 16, 3, 224, 224]
    frames = np.array(frames).transpose(0, 3, 1, 2)
    frames = np.expand_dims(frames, axis=0)
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
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a video")

    # log the filename for easier debugging
    print(f"/predict called with {file.filename} ({content_type})")

    # If model not loaded, use demo mode
    if session is None:
        # Demo mode - return random prediction
        demo_predictions = [
            {"label": "Real", "confidence": 0.87},
            {"label": "AI-generated", "confidence": 0.72},
            {"label": "Real", "confidence": 0.91},
            {"label": "AI-generated", "confidence": 0.68},
        ]
        demo = demo_predictions[np.random.randint(0, len(demo_predictions))]
        confidence_percentage = int(demo["confidence"] * 100)
        
        return PredictionResponse(
            prediction=f"{confidence_percentage}% {demo['label']}",
            confidence=demo["confidence"],
            label=demo["label"],
            raw_probability={"AI-generated": 1 - demo["confidence"], "Real": demo["confidence"]} if demo["label"] == "Real" else {"AI-generated": demo["confidence"], "Real": 1 - demo["confidence"]},
            logits=[[1.5, 2.1]] if demo["label"] == "Real" else [[-2.1, 1.8]]
        )
    
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
        
        labels = ["AI-generated", "Real"]
        predicted_label = labels[predicted_class_index]
        
        # Format prediction string
        confidence_percentage = int(confidence * 100)
        prediction_str = f"{confidence_percentage}% {predicted_label}"
        
        return PredictionResponse(
            prediction=prediction_str,
            confidence=confidence,
            label=predicted_label,
            raw_probability={
                "AI-generated": float(probs[0][0]),
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
        "supported_formats": ["mp4", "avi", "mov", "mkv", "flv"],
        "classes": ["AI-generated", "Real"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
