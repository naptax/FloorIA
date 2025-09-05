# 🏗️ FloorIA - AI-Powered Floor Plan Analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Vue.js 3](https://img.shields.io/badge/Vue.js-3-green.svg)](https://vuejs.org/)

FloorIA est une plateforme d'analyse de plans d'étage alimentée par l'IA, conçue pour les architectes, urbanistes et professionnels de l'immobilier.

## ✨ Fonctionnalités principales

- 🤖 **Analyse IA** : Détection automatique des éléments architecturaux via Roboflow
- 🔐 **Authentification sécurisée** : Gestion des utilisateurs avec Supabase
- 📊 **Interface moderne** : Interface utilisateur Vue.js 3 avec TypeScript
- ☁️ **Déploiement cloud** : Prêt pour Render avec configuration automatique
- 🌍 **Multi-environnements** : Gestion automatique local/production

## 🏗️ Architecture technique

### Backend
- **FastAPI** : API REST haute performance
- **Python 3.13+** : Langage principal
- **Supabase** : Base de données PostgreSQL et authentification
- **Roboflow** : Modèles d'IA pour l'analyse d'images
- **Uvicorn** : Serveur ASGI

### Frontend
- **Vue.js 3** : Framework JavaScript réactif
- **TypeScript** : Typage statique
- **Vite** : Build tool moderne
- **Supabase JS** : Client pour l'authentification

## 🚀 Démarrage rapide

### Prérequis
- Python 3.13+
- Node.js 18+
- Compte Supabase configuré

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/naptax/FloorIA.git
cd FloorIA
```

2. **Configuration Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Variables d'environnement**
```bash
# Backend - Copier et éditer avec vos vraies valeurs
cp backend/.env.example backend/.env

# Frontend - Sélection automatique d'environnement :
# ✅ .env.local (développement) - déjà configuré
# ✅ .env.production (Render) - déjà configuré
```

4. **Configuration Frontend**
```bash
source backend/venv/bin/activate  # Toujours utiliser le venv
cd frontend
npm install
```

### Lancement de l'application

1. **Démarrer le backend**
```bash
source backend/venv/bin/activate
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

2. **Démarrer le frontend** (nouveau terminal)
```bash
source backend/venv/bin/activate
cd frontend
npm run dev  # Utilise automatiquement .env.local
```

3. **Accéder à l'application**
- Frontend: http://localhost:3001 (ou port suivant disponible)
- Backend API: http://localhost:8000
- Documentation API: http://localhost:8000/docs

### Gestion des environnements
- **Développement** : Utilise `.env.local` automatiquement
- **Production** : Utilise `.env.production` automatiquement
- **Pas de changement manuel nécessaire** - Vite gère selon le script utilisé

## 📚 Documentation détaillée

- 🏠 **Développement local** : Voir `LOCAL_DEVELOPMENT.md`
- 🚀 **Déploiement Render** : Voir `RENDER_DEPLOYMENT.md`
- 🔐 **Authentification** : Voir `AUTHENTICATION.md`

## 🌐 Déploiement

### Render (Recommandé)
- **Backend** : Web Service Python
- **Frontend** : Static Site
- **Configuration automatique** via fichiers .env

Voir `RENDER_DEPLOYMENT.md` pour les instructions complètes.

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

## 🛡️ Sécurité

- ✅ **Inscription désactivée** - Seuls les comptes autorisés peuvent se connecter
- ✅ **Authentification JWT** - Tokens sécurisés via Supabase
- ✅ **Séparation des clés** - Clés anon (frontend) et service (backend)
- ✅ **CORS configuré** - Protection contre les requêtes non autorisées

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 🙏 Remerciements

- [Supabase](https://supabase.com) pour l'authentification et la base de données
- [Roboflow](https://roboflow.com) pour les modèles d'IA
- [Render](https://render.com) pour l'hébergement cloud
- [Vue.js](https://vuejs.org) pour le framework frontend
- [FastAPI](https://fastapi.tiangolo.com) pour le framework backend

---

**FloorIA** - Transformez vos plans d'étage avec l'intelligence artificielle 🏗️✨
