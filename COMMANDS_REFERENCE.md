# 📋 FloorIA - Référence des Commandes

## 🚀 Lancement des services

### **Backend**
```bash
# Méthode recommandée (script automatisé)
./start-backend.sh

# Méthode manuelle
source backend/venv/bin/activate && cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### **Frontend**
```bash
# Méthode recommandée (script automatisé)
./start-frontend.sh

# Méthode manuelle
source backend/venv/bin/activate && cd frontend && npm run dev
```

## 🛑 Arrêt des services

### **Backend**
```bash
# Méthode recommandée
pkill -f "uvicorn main:app"

# Par port (si nécessaire)
sudo lsof -t -i:8000 | xargs kill -9

# Vérification manuelle
ps aux | grep -E "(uvicorn|python.*main)" | grep -v grep
kill -9 [PID]
```

### **Frontend**
```bash
# Dans le terminal du frontend
Ctrl+C
```

### **Arrêt complet**
```bash
# Nettoyer tous les services
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null
sudo lsof -t -i:8000 | xargs kill -9 2>/dev/null
echo "✅ Tous les services arrêtés"
```

## 🔍 Vérification et diagnostic

### **Status des services**
```bash
# Vérifier le backend
curl http://localhost:8000/health
ps aux | grep uvicorn | grep -v grep

# Vérifier les ports
lsof -i:8000  # Backend
lsof -i:3001  # Frontend (port variable)
```

### **Logs et debugging**
```bash
# Voir les processus actifs
ps aux | grep -E "(uvicorn|python.*main|vite)" | grep -v grep

# Tester la connectivité
curl -I http://localhost:8000/health
curl -I http://localhost:3001/
```

## 🔧 Gestion des environnements

### **Variables d'environnement**
```bash
# Backend - Configuration manuelle requise
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos vraies clés

# Frontend - Automatique selon le mode
# npm run dev    → utilise .env.local (localhost:8000)
# npm run build  → utilise .env.production (flooria.onrender.com)
```

### **Installation des dépendances**
```bash
# Backend
source backend/venv/bin/activate
cd backend
pip install -r requirements.txt

# Frontend
source backend/venv/bin/activate  # Toujours activer le venv
cd frontend
npm install
```

## ⚡ Commandes rapides

### **Workflow de développement typique**
```bash
# 1. Démarrer le backend
./start-backend.sh

# 2. Dans un nouveau terminal, démarrer le frontend
./start-frontend.sh

# 3. Accéder à l'application
# Frontend: http://localhost:3001/
# Backend API: http://localhost:8000/docs

# 4. Arrêter quand terminé
pkill -f "uvicorn main:app"  # Backend
Ctrl+C                       # Frontend (dans son terminal)
```

### **Résolution de problèmes courants**
```bash
# Erreur "Address already in use"
pkill -f "uvicorn main:app"
./start-backend.sh

# Réinstaller les dépendances
source backend/venv/bin/activate
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Reset complet
pkill -f "uvicorn main:app"
pkill -f "vite"
rm -rf frontend/node_modules
npm install
```

## 🌐 URLs importantes

- **Frontend Dev**: http://localhost:3001/ (port automatique)
- **Backend API**: http://localhost:8000/
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Redoc**: http://localhost:8000/redoc

## 📝 Notes importantes

- ⚠️ **Toujours activer le venv** avant toute commande
- ✅ Scripts automatisés recommandés pour éviter les erreurs
- 🔄 Hot reload activé sur backend et frontend
- 🌍 Gestion automatique des environnements (local/production)
- 🚫 Ne jamais committer `backend/.env` (contient les vraies clés)
