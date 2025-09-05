# 🏠 FloorIA - Guide de Développement Local

## 📋 Prérequis
- Python 3.13+ installé
- Node.js 18+ et npm installés
- Git configuré
- Compte Supabase configuré

## 🚀 Lancement de l'application en local

### 1️⃣ **Préparation de l'environnement**

```bash
# Cloner le repository
git clone https://github.com/naptax/FloorIA.git
cd FloorIA

# Activer l'environnement virtuel Python
source backend/venv/bin/activate

# Installer les dépendances backend
cd backend
pip install -r requirements.txt
cd ..

# Installer les dépendances frontend
cd frontend
npm install
cd ..
```

### 2️⃣ **Configuration des variables d'environnement**

Le projet utilise un système d'environnements séparés :

**Backend** (`backend/.env`) :
```bash
# Copier le fichier exemple
cp backend/.env.example backend/.env

# Éditer avec vos vraies valeurs
ROBOFLOW_API_KEY=votre_cle_roboflow
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_TOKEN=votre_service_role_key
SUPABASE_APIKEY=votre_anon_key
```

**Frontend** (automatique) :
- ✅ `.env.local` → Utilisé automatiquement en développement
- ✅ Pointe vers `http://localhost:8000` (backend local)

### 3️⃣ **Démarrage des services**

#### **Méthode 1 : Scripts automatisés (Recommandé)**

**Backend :**
```bash
./start-backend.sh
```

**Frontend :**
```bash
./start-frontend.sh
```

#### **Méthode 2 : Commandes manuelles**

**Terminal 1 - Backend :**
```bash
source backend/venv/bin/activate
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend :**
```bash
source backend/venv/bin/activate
cd frontend
npm run dev
```

### 4️⃣ **Accès à l'application**

- **Frontend** : http://localhost:3001/
- **Backend API** : http://localhost:8000
- **Health Check** : http://localhost:8000/health
- **API Docs** : http://localhost:8000/docs

## 🔧 Scripts disponibles

### Frontend
```bash
npm run dev          # Développement (utilise .env.local)
npm run build        # Build production (utilise .env.production)
npm run build:local  # Build local (utilise .env.local)
npm run type-check   # Vérification TypeScript
```

### Backend
```bash
python -m uvicorn main:app --reload  # Développement avec hot reload
python main.py                       # Lancement simple
```

## 🌍 Gestion des environnements

### Fichiers d'environnement
```
frontend/
├── .env.local      # 🏠 Développement local (localhost:8000)
├── .env.production # 🚀 Production Render (flooria.onrender.com)
└── .env.example    # 📄 Template de documentation
```

### Sélection automatique
- `npm run dev` → Utilise `.env.local`
- `npm run build` → Utilise `.env.production`

## 🔍 Vérification du fonctionnement

### Backend
```bash
curl http://localhost:8000/health
# Réponse attendue: {"status":"healthy","service":"vectorizator-backend"}
```

### Frontend
- Ouvrir http://localhost:3001/
- Vérifier que l'authentification fonctionne
- Tester l'upload d'image

## 🛑 Arrêt des services

### **Arrêter le backend**

**Méthode 1 : Par nom de processus (Recommandé)**
```bash
pkill -f "uvicorn main:app"
```

**Méthode 2 : Par port**
```bash
sudo lsof -t -i:8000 | xargs kill -9
```

**Méthode 3 : Vérifier puis tuer manuellement**
```bash
# 1. Lister les processus
ps aux | grep -E "(uvicorn|python.*main)" | grep -v grep

# 2. Tuer par PID (remplacer XXXX par le PID)
kill -9 XXXX
```

### **Arrêter le frontend**
```bash
# Dans le terminal du frontend, simplement :
Ctrl+C
```

### **Arrêter tout d'un coup**
```bash
# Script pour nettoyer complètement
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null
sudo lsof -t -i:8000 | xargs kill -9 2>/dev/null
echo "✅ Tous les services arrêtés"
```

## 📋 Référence rapide des commandes

### **Lancement**
```bash
# Backend (méthode script)
./start-backend.sh

# Backend (méthode manuelle)
source backend/venv/bin/activate && cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (méthode script)  
./start-frontend.sh

# Frontend (méthode manuelle)
source backend/venv/bin/activate && cd frontend && npm run dev
```

### **Arrêt**
```bash
# Arrêter le backend
pkill -f "uvicorn main:app"

# Arrêter le frontend
Ctrl+C (dans le terminal)

# Vérifier qu'aucun processus ne tourne
ps aux | grep -E "(uvicorn|python.*main)" | grep -v grep
```

### **Vérification**
```bash
# Backend health check
curl http://localhost:8000/health

# Vérifier les ports utilisés
lsof -i:8000  # Backend
lsof -i:3001  # Frontend (ou 3000, 3002...)
```

## 🐛 Dépannage

### **Erreur "Address already in use"**
```bash
# Le backend tourne déjà, l'arrêter d'abord
pkill -f "uvicorn main:app"
# Puis relancer
./start-backend.sh
```

### Port déjà utilisé (Frontend)
Si le port 3000 est occupé, Vite utilisera automatiquement 3001, 3002, etc.

### Erreurs d'authentification
Vérifier que les clés Supabase sont correctes dans `backend/.env`

### Erreurs Roboflow
Vérifier la clé API Roboflow et les quotas sur roboflow.com

### Problèmes de CORS
Le backend est configuré pour accepter les requêtes depuis localhost:3000-3010

## 📝 Notes importantes

- **Toujours activer le venv** avant toute commande
- Les fichiers `.env.local` et `.env.production` sont commitées (pas de secrets)
- Le fichier `backend/.env` contient les vraies clés (ne pas committer)
- Hot reload activé sur backend et frontend
