# 🚀 FloorIA - Guide de Déploiement Railway

## 📋 Prérequis
- Compte Railway créé et connecté à GitHub
- Repository FloorIA accessible depuis Railway
- Clés API Roboflow disponibles

## 🔧 Configuration Railway

### 1. Créer les Services

#### Backend Service
1. **New Project** → **Deploy from GitHub repo**
2. Sélectionner `naptax/FloorIA`
3. **Root Directory**: `/backend`
4. **Branch**: `production` (important !)
5. **Service Name**: `flooria-backend`

#### Frontend Service  
1. **Add Service** → **GitHub Repo**
2. **Root Directory**: `/frontend`
3. **Branch**: `production` (important !)
4. **Service Name**: `flooria-frontend`

### 2. Variables d'Environnement

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

### 3. Domaines Personnalisés (Optionnel)
- Backend: `api.flooria.com`
- Frontend: `app.flooria.com`

## 🌿 Workflow de Déploiement

### Déploiement Automatique
```bash
# Développement sur master
git checkout master
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin master

# Déploiement en production
git checkout production
git merge master
git push origin production  # 🚀 Déploiement automatique !
```

### Rollback Rapide
```bash
git checkout production
git reset --hard HEAD~1  # Revenir au commit précédent
git push --force origin production
```

## 📊 Monitoring

### Health Checks
- **Backend**: `https://your-backend.railway.app/health`
- **Frontend**: `https://your-frontend.railway.app/`

### Logs en Temps Réel
- Dashboard Railway → Service → Logs
- CLI: `railway logs --service flooria-backend`

## 🔮 Évolution Future - Base de Données

### Ajout PostgreSQL
1. **Add Service** → **Database** → **PostgreSQL**
2. Variable automatique: `DATABASE_URL`
3. Mise à jour backend:
```python
# requirements.txt
psycopg2-binary==2.9.7
sqlalchemy==2.0.21

# main.py
DATABASE_URL = os.getenv("DATABASE_URL")
```

## 🚨 Troubleshooting

### Problèmes Courants
- **Build Failed**: Vérifier `requirements.txt` / `package.json`
- **Health Check Failed**: Vérifier les endpoints `/health`
- **CORS Errors**: Vérifier `CORS_ORIGINS` dans le backend

### Support
- Railway Discord: https://discord.gg/railway
- Documentation: https://docs.railway.app/
