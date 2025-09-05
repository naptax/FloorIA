# 🚀 FloorIA - Render Deployment Guide

## 📋 Prerequisites
- [Render](https://render.com) account created and connected to GitHub
- FloorIA repository accessible from Render
- Roboflow API keys available
- Supabase project configured

## 🔧 Render Configuration

### 1. Backend Service (Web Service)

#### Service Configuration
1. **New Web Service** → **Connect Repository**
2. Select `naptax/FloorIA`
3. **Root Directory**: `backend`
4. **Environment**: `Python 3`
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Environment Variables
```
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_WORKSPACE=cubicasa5k-2-qpmsa-tppfc
ROBOFLOW_PROJECT=cubicasa5k-2-qpmsa-tppfc
ROBOFLOW_VERSION=1
SUPABASE_URL=https://zyhrkukwhlxenfivkyxs.supabase.co
SUPABASE_TOKEN=your_supabase_service_role_key
SUPABASE_APIKEY=your_supabase_anon_key
```

### 2. Frontend Service (Static Site)

#### Service Configuration
1. **New Static Site** → **Connect Repository**
2. Select `naptax/FloorIA`
3. **Root Directory**: `frontend`
4. **Build Command**: `npm ci && npm run build`
5. **Publish Directory**: `dist`

#### Environment Variables
```
VITE_SUPABASE_URL=https://zyhrkukwhlxenfivkyxs.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://flooria.onrender.com
```

## 🌐 URLs
- **Backend API**: `https://flooria.onrender.com`
- **Frontend App**: `https://flooria-frontend.onrender.com` (or your custom domain)

## 🔄 Deployment Process

### Step 1: Deploy Backend First
1. Create the backend Web Service
2. Configure environment variables
3. Deploy and wait for completion
4. Verify API is accessible at `https://flooria.onrender.com/health`

### Step 2: Deploy Frontend
1. Create the frontend Static Site
2. Set `VITE_API_BASE_URL=https://flooria.onrender.com`
3. Configure other environment variables
4. Deploy and test the complete application

## 🔍 Health Checks

### Backend Health Check
```bash
curl https://flooria.onrender.com/health
```
Expected response:
```json
{"status":"healthy","service":"vectorizator-backend"}
```

### Frontend Check
- Visit your frontend URL
- Verify authentication works
- Test image upload and analysis

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend allows frontend domain in CORS settings
   - Check `CORS_ORIGINS` environment variable

2. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` points to correct backend URL
   - Check backend service is running and healthy

3. **Authentication Issues**
   - Verify Supabase keys are correctly configured
   - Ensure anon key matches between frontend and backend

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Review build logs for specific errors

## 📝 Notes

- Render automatically handles SSL certificates
- Services auto-deploy on git push to connected branch
- Free tier has limitations (750 hours/month for web services)
- Static sites are free with generous bandwidth

## 🔐 Security Checklist

- ✅ Never commit `.env` files to repository
- ✅ Use environment variables for all secrets
- ✅ Separate anon keys (frontend) from service keys (backend)
- ✅ Enable HTTPS only in production
- ✅ Configure proper CORS origins
