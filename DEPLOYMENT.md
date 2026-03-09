# Deployment Guide - Deepfake Detection News Portal

## 📋 Pre-Deployment Checklist

- [x] Application tested locally
- [x] All components responsive (mobile, tablet, desktop)
- [x] Authentication system working
- [x] Media upload and validation functional
- [x] Environment variables configured
- [x] Build optimized for production

## 🚀 Deployment Steps

### 1. Frontend Deployment (Next.js)

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Option B: Docker
```bash
# Build Docker image
docker build -t deepfake-news:latest .

# Run container
docker run -p 3000:3000 deepfake-news:latest
```

#### Option C: Traditional Server
```bash
cd /path/to/project

# Build the app
npm run build

# Start production server
npm start
```

### 2. Backend Deployment (FastAPI)

#### Option A: Docker
```bash
cd backend

# Build Docker image
docker build -t deepfake-api:latest .

# Run container
docker run -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e ALLOWED_ORIGINS="https://www.example.com,https://example.com" \
  deepfake-api:latest
```

#### Option B: Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create deepfake-api

# Set environment variables
heroku config:set ENVIRONMENT=production
heroku config:set ALLOWED_ORIGINS="https://www.example.com"

# Deploy
git push heroku main
```

#### Option C: Traditional Server
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run with gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

### 3. Environment Variables

#### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://www.yourdomain.com
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

#### Backend
```
ENVIRONMENT=production
ALLOWED_ORIGINS=https://www.yourdomain.com,https://yourdomain.com
```

## 🔒 Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] CORS origins restricted to production domains
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] CSRF protection active
- [ ] XSS prevention enabled
- [ ] Content Security Policy headers set
- [ ] Model file (.onnx) secured
- [ ] Database backups scheduled
- [ ] Monitoring and logging configured

## 📊 Performance Optimization

### Frontend
- Next.js automatically optimizes images
- Code splitting enabled
- CSS and JS minified
- Turbopack for faster builds
- Static site generation for static pages

### Backend
- Model loaded once at startup
- Request pooling configured
- Compression enabled
- Caching headers set appropriately

## 🛠️ Post-Deployment

### 1. Monitor Application
```bash
# Check logs
tail -f logs/application.log

# Monitor performance
# Use tools like New Relic, Datadog, or Sentry
```

### 2. Setup Backups
- Database backups every 24 hours
- Configuration backups
- Model file backups

### 3. SSL Certificate
```bash
# Using Let's Encrypt (free)
certbot certonly --standalone -d yourdomain.com
```

## 🔧 Troubleshooting

### Backend API Connection Issues
1. Check CORS configuration
2. Verify API_URL matches backend domain
3. Check firewall rules
4. Verify SSL certificates

### Model Loading Issues
1. Ensure model.onnx exists in backend/model/
2. Check file permissions
3. Verify ONNX Runtime is installed
4. Check available disk space

### Performance Issues
1. Enable caching headers
2. Optimize database queries
3. Use CDN for static assets
4. Monitor memory usage

## 📈 Scaling Considerations

### Frontend
- Use CDN (Cloudflare, Bunny CDN)
- Implement incremental static regeneration (ISR)
- Use edge functions for API routes

### Backend
- Use load balancer (nginx, HAProxy)
- Horizontal scaling with multiple instances
- Use message queue for async jobs (Redis, RabbitMQ)
- Implement database connection pooling

## 🔐 SSL/TLS Setup

### Using Let's Encrypt + Nginx
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 📞 Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Docker Docs:** https://docs.docker.com
- **Vercel Deployment:** https://vercel.com/docs

---

**Version:** 1.0.0  
**Last Updated:** March 9, 2026
