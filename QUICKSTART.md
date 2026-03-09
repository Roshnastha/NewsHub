# 🚀 Quick Start Guide - Deepfake Detection News Portal

## 5-Minute Setup

### Development Environment

```bash
# 1. Clone and install
git clone <repository>
cd deepfake-detection-portal
npm install

# 2. Start Frontend (Terminal 1)
npm run dev
# Visit: http://localhost:3000

# 3. Start Backend (Terminal 2)
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install and run
pip install -r requirements.txt
python main.py
# Backend: http://localhost:8000
```

## Testing Checklist

### Authentication ✅
- [ ] Create reader account via email sign-up
- [ ] Create reader account via Google/Microsoft/Apple
- [ ] Login as Publisher
- [ ] Logout functionality
- [ ] User profile display
- [ ] Session persistence

### Article Management ✅
- [ ] View article list (all users)
- [ ] Filter articles by category
- [ ] Search articles
- [ ] Bookmark articles (readers)
- [ ] View article details
- [ ] Edit article (publishers only)
- [ ] Delete article (publishers only)

### Add News Feature ✅
- [ ] Click "Add News" button (publishers only)
- [ ] Fill article form
- [ ] Upload image
- [ ] Upload video
- [ ] Validate media (takes 2-3 seconds)
- [ ] See validation results
- [ ] Publish article
- [ ] New article appears at top

### Responsive Design ✅
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640-1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Check navigation responsiveness
- [ ] Verify touch interactions
- [ ] Test menu on mobile

### Theme Toggle ✅
- [ ] Switch between light/dark mode
- [ ] Theme persists on reload
- [ ] All components properly themed
- [ ] Readable in both themes

### Backend API ✅
- [ ] Health check: `GET http://localhost:8000/health`
- [ ] Upload image: `POST http://localhost:8000/predict`
- [ ] Upload video: `POST http://localhost:8000/predict`
- [ ] DEMO mode predictions work

## Deployment Checklist

### Pre-Deployment
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Model file in backend/model/ (if using real model)

### Frontend Deployment
- [ ] Environment variables set
- [ ] API URLs pointing to deployed backend
- [ ] Build artifact verified
- [ ] CDN configured (optional)
- [ ] SSL certificate valid
- [ ] Domain DNS configured

### Backend Deployment
- [ ] Python environment configured
- [ ] Dependencies installed
- [ ] CORS origins updated
- [ ] Environment set to production
- [ ] Model file uploaded
- [ ] Database configured
- [ ] Logging enabled
- [ ] Monitoring configured

### Post-Deployment
- [ ] Health checks passing
- [ ] API responding correctly
- [ ] Frontend loading properly
- [ ] Authentication working
- [ ] File uploads functional
- [ ] Email notifications (if configured)
- [ ] Error tracking working

## Common Commands

```bash
# Development
npm run dev              # Start frontend dev server
python main.py          # Start backend server

# Production
npm run build            # Build for production
npm start               # Start production server
gunicorn main:app       # Run backend with gunicorn

# Docker
docker-compose up       # Start both services
docker-compose down     # Stop both services

# Database (if applicable)
# psql -U user -d database < schema.sql

# Monitoring
curl http://localhost:8000/health
curl http://localhost:3000/api/health
```

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### Backend Model Error
```
⚠️  Error loading model: [ONNXRuntimeError]
```
This is expected in DEMO mode. Place model.onnx in `backend/model/` when ready.

### CORS Error
Check backend CORS configuration if frontend can't connect.
Update `ALLOWED_ORIGINS` in `backend/main.py`.

### Build Failure
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Performance Tips

1. **Frontend**
   - Use `npm run build` for production
   - Enable gzip compression
   - Use CDN for static assets
   - Enable HTTP/2

2. **Backend**
   - Use gunicorn with multiple workers
   - Enable caching headers
   - Use database connection pooling
   - Monitor memory usage

3. **Database** (if applicable)
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Regular backups
   - Query optimization

## Mobile Testing

```bash
# Test on device (find your IP address)
ipconfig getifaddr en0          # macOS
hostname -I                     # Linux
ipconfig                        # Windows

# Access from mobile
http://<YOUR_IP>:3000
```

## Documentation Links

- [Full Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./backend/README.md)
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangodb.com)

## Support

- Issue Tracker: GitHub Issues
- Email: support@example.com
- Documentation: See in-code comments

---

**Last Updated:** March 9, 2026  
**Version:** 1.0.0
