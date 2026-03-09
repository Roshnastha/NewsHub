# 🎯 Deepfake Detection News Portal

A modern, full-stack news portal with AI-powered deepfake detection for images and videos. Featuring role-based access control, real-time article management, and advanced media verification.

## ✨ Features

- **🔐 Role-Based Authentication**
  - Reader accounts (sign-up via email or social login: Google, Microsoft, Apple)
  - Publisher accounts (publish and edit articles)
  - Secure JWT-based session management

- **📰 News Management**
  - Publishers can create, edit, and delete articles
  - Real-time article feed with trending content
  - Category-based article filtering
  - Article search and browse functionality

- **🤖 AI-Powered Media Verification**
  - Image deepfake detection using ONNX model
  - Video frame extraction and analysis
  - Real-time confidence scores
  - DEMO mode for testing without model file

- **📱 Fully Responsive Design**
  - Mobile-first approach
  - Works on smartphones, tablets, and desktops
  - Touch-friendly interface
  - Optimized performance

- **🌓 Dark Mode Support**
  - System preference detection
  - Manual theme toggle
  - Persistent theme preference

## 🚀 Quick Start

### Development

```bash
# 1. Install dependencies
npm install

# 2. Start frontend (localhost:3000)
npm run dev

# 3. In another terminal, start backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py  # Runs on localhost:8000
```

### Production (Docker)

```bash
# Using Docker Compose
docker-compose up -d
```

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional)

### Frontend Setup
```bash
git clone <repository>
cd deepfake-detection-portal
npm install
npm run build
npm start
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Backend**
```
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000
```

## 📖 Usage Guide

### For Readers
1. Visit the portal and create account
2. Browse articles by category
3. Bookmark favorite articles
4. View AI verification status

### For Publishers
1. Sign in with Publisher account
2. Click "➕ Add News" in article feed
3. Fill article details
4. Upload image/video and click "Validate Media"
5. Publish once validated

## 🏗️ Project Structure

```
├── app/
│   ├── components/         # React components
│   ├── context/           # Auth & News contexts
│   ├── login/             # Authentication pages
│   └── globals.css        # Global styles
├── backend/
│   ├── main.py           # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── model/            # ONNX model storage
├── public/               # Static assets
└── DEPLOYMENT.md         # Deployment guide
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment options including:
- Vercel, Netlify, or self-hosted
- Docker containerization
- Backend hosting (Heroku, Railway, AWS)

## 📱 Responsive Design

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All components optimized for each breakpoint.

## 🔗 API Endpoints

### Health Check
```
GET /health
```

### Media Prediction
```
POST /predict
Content-Type: multipart/form-data
Body: file (image or video)
```

## 🔒 Security Features

- ✅ Role-based access control
- ✅ CORS protection
- ✅ Input validation
- ✅ Secure file uploads
- ✅ XSS/CSRF protection

## 📝 Technology Stack

- **Frontend:** Next.js 16.1.1, React 19, TypeScript
- **Backend:** FastAPI 0.135.1, Python 3.13
- **ML:** ONNX Runtime, OpenCV
- **DevOps:** Docker, Docker Compose

## 📧 Support

- Open GitHub Issues for bug reports
- See DEPLOYMENT.md for production setup
- Documentation available in docs/

---

**Version:** 1.0.0 | **Status:** ✅ Production Ready
