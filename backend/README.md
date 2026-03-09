# Deepfake Detection API (ONNX)

FastAPI backend for video deepfake detection using ONNX model.

## Setup Instructions

### 1. Create and Activate Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Place Your Model

Create a `model` folder and add your ONNX model file:
```
backend/
├── model/
│   └── model.onnx           # Your ONNX deepfake detection model
├── main.py
├── requirements.txt
└── README.md
```

### 4. Run the Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### 1. Health Check
```
GET /health
```
Check if the API and model are running.

### 2. Predict on Video
```
POST /predict
Content-Type: multipart/form-data

file: <video_file.mp4>
```

**Supported formats**: mp4, avi, mov, mkv, flv, etc.

**Response:**
```json
{
  "prediction": "92% Real",
  "confidence": 0.92,
  "label": "Real",
  "raw_probability": {
    "AI-generated": 0.08,
    "Real": 0.92
  },
  "logits": [[-2.15, 2.45]]
}
```

### 3. API Info
```
GET /info
```
Get API information and model details.

## Model Requirements

Your ONNX model should:
- Accept input shape: `[1, 16, 3, 224, 224]`
  - Batch size: 1
  - Frames: 16 consecutive frames
  - Channels: 3 (RGB)
  - Resolution: 224x224 pixels

- Output logits for 2 classes:
  - Class 0: AI-generated
  - Class 1: Real

## How It Works

1. **Video Upload**: Client uploads video file
2. **Frame Extraction**: API extracts first 16 consecutive frames
3. **Preprocessing**: 
   - Convert BGR to RGB
   - Resize to 224x224
   - Normalize to [0, 1]
   - Reshape to [1, 16, 3, 224, 224]
4. **Inference**: ONNX model processes frames
5. **Softmax**: Convert logits to probabilities
6. **Response**: Return prediction with confidence

## Testing

### Test API Health
```bash
curl http://localhost:8000/health
```

### Test Prediction
```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@your_video.mp4"
```

### Interactive Docs
Open http://localhost:8000/docs and use the Swagger UI to test endpoints.

## Troubleshooting

- **Model not found**: Verify `model.onnx` is in `backend/model/`
- **CORS errors**: Check if frontend URL is in `allow_origins`
- **Video too short**: Model requires minimum 16 frames
- **Memory error**: Video files are loaded entirely; use smaller clips
- **ONNX Runtime error**: Ensure ONNX model version is compatible

## Performance Tips

- Compress videos for faster uploads
- Use web-friendly formats (mp4)
- Consider video length vs. model accuracy
- Implement caching for duplicate videos

## Production Deployment

For production:
1. Use gunicorn: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
2. Add rate limiting to prevent abuse
3. Configure CORS to specific domain
4. Use HTTPS
5. Add authentication if needed
6. Monitor video upload sizes

