# 🚀 FloorIA - [Railway](https://railway.app) Deployment Guide

## 📋 Prerequisites
- [Railway](https://railway.app) account created and connected to GitHub
- FloorIA repository accessible from [Railway](https://railway.app)
- Roboflow API keys available

## 🔧 [Railway](https://railway.app) Configuration

### 1. Create Services

#### Backend Service
1. **New Project** → **Deploy from GitHub repo**
2. Select `naptax/FloorIA`
3. **Root Directory**: `/backend`
4. **Branch**: `production` (important!)
5. **Service Name**: `flooria-backend`

#### Frontend Service  
1. **Add Service** → **GitHub Repo**
2. **Root Directory**: `/frontend`
3. **Branch**: `production` (important!)
4. **Service Name**: `flooria-frontend`

### 2. Environment Variables

#### Backend Variables
```
ROBOFLOW_API_KEY=your_api_key
ROBOFLOW_MODEL_ID=your_model_id
CORS_ORIGINS=https://flooria-frontend.up.railway.app
ENVIRONMENT=production
```

#### Frontend Variables
```
VITE_API_BASE_URL=https://flooria-backend.up.railway.app
NODE_ENV=production
```

### 3. Custom Domains (Optional)
- Backend: `api.flooria.com`
- Frontend: `app.flooria.com`

## 🌿 Deployment Workflow

### Automatic Deployment
```bash
# Development on master
git checkout master
git add .
git commit -m "feat: new feature"
git push origin master

# Production deployment
git checkout production
git merge master
git push origin production  # 🚀 Automatic deployment!
```

### Quick Rollback
```bash
git checkout production
git reset --hard HEAD~1  # Return to previous commit
git push --force origin production
```

## 📊 Monitoring

### Health Checks
- **Backend**: `https://your-backend.railway.app/health`
- **Frontend**: `https://your-frontend.railway.app/`

### Real-time Logs
- [Railway](https://railway.app) Dashboard → Service → Logs
- CLI: `railway logs --service flooria-backend`

## 🔮 Future Evolution - Database

### Adding PostgreSQL
1. **Add Service** → **Database** → **PostgreSQL**
2. Automatic variable: `DATABASE_URL`
3. Backend update:
```python
# requirements.txt
psycopg2-binary==2.9.7
sqlalchemy==2.0.21

# main.py
DATABASE_URL = os.getenv("DATABASE_URL")
```

## 🚨 Troubleshooting

### Common Issues
- **Build Failed**: Check `requirements.txt` / `package.json`
- **Health Check Failed**: Check `/health` endpoints
- **CORS Errors**: Check `CORS_ORIGINS` in backend

### Support
- [Railway](https://railway.app) Discord: https://discord.gg/railway
- Documentation: https://docs.railway.app/
