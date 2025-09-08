# FloorIA - Analyse IA de Plans Architecturaux

FloorIA est une application web moderne qui utilise l'intelligence artificielle pour analyser automatiquement les plans architecturaux et détecter les éléments structurels tels que les murs, portes, fenêtres et pièces.

## 🎯 Fonctionnalités

- **Analyse IA automatique** : Détection des éléments architecturaux via l'API Roboflow
- **Interface moderne** : Application Vue.js 3 avec design Tokyo Night
- **Visualisation interactive** : Canvas zoomable avec sélection d'éléments
- **Authentification sécurisée** : Système d'authentification via Supabase
- **Export de données** : Sauvegarde des résultats d'analyse en JSON
- **Tri intelligent** : Tableau des détections trié par confiance décroissante

## 🏗️ Architecture

### Frontend
- **Vue.js 3** avec Composition API et TypeScript
- **Vite** pour le développement et le build
- **Canvas HTML5** pour la visualisation interactive
- **Design Tokyo Night** avec polices Slack (Lato)

### Backend
- **Python/FastAPI** pour l'API REST
- **Roboflow** pour l'analyse IA des plans
- **Supabase** pour l'authentification et la base de données
- **Uvicorn** comme serveur ASGI

## 📋 Prérequis

- **Python 3.8+** avec pip
- **Node.js 16+** avec npm
- **Compte Roboflow** avec accès API
- **Projet Supabase** configuré

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/naptax/FloorIA.git
cd FloorIA
```

### 2. Configuration du Backend

#### Créer l'environnement virtuel Python
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# ou
venv\Scripts\activate     # Windows
```

#### Installer les dépendances Python
```bash
pip install -r requirements.txt
```

#### Configuration des variables d'environnement
```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos clés API :
```env
# Roboflow API Configuration
ROBOFLOW_API_KEY=votre_cle_roboflow_ici
ROBOFLOW_WORKSPACE=cubicasa5k-2-qpmsa-tppfc
ROBOFLOW_PROJECT=cubicasa5k-2-qpmsa-tppfc
ROBOFLOW_VERSION=1

# Supabase Configuration
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_TOKEN=votre_cle_anon_supabase_ici
SUPABASE_APIKEY=votre_cle_anon_supabase_ici
```

### 3. Configuration du Frontend

#### Installer les dépendances Node.js
```bash
cd ../frontend
# IMPORTANT: Utiliser le venv Python même pour npm
source ../backend/venv/bin/activate
npm install
```

#### Configuration de l'environnement frontend
```bash
cp .env.example .env.production
```

Éditer `.env.production` :
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🔑 Configuration des API

### Roboflow
1. Créer un compte sur [Roboflow](https://roboflow.com)
2. Obtenir votre clé API dans les paramètres du compte
3. Le modèle utilisé : **CubiCasa5K** pour la détection d'éléments architecturaux
4. Workspace : `cubicasa5k-2-qpmsa-tppfc`
5. Projet : `cubicasa5k-2-qpmsa-tppfc`
6. Version : `1`

### Supabase
1. Créer un projet sur [Supabase](https://supabase.com)
2. Récupérer l'URL du projet et la clé anon
3. Configurer l'authentification par email
4. Voir `AUTHENTICATION.md` pour la configuration détaillée

## 🚀 Lancement de l'Application

### Démarrage du Backend
```bash
# Dans le répertoire backend, avec le venv activé
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Le backend sera accessible sur : http://localhost:8000

### Démarrage du Frontend
```bash
# Dans le répertoire frontend, avec le venv activé
source ../backend/venv/bin/activate
npm run dev
```

Le frontend sera accessible sur : http://localhost:3000

## 🤖 Modèle Roboflow

FloorIA utilise le modèle **CubiCasa5K** via l'API Roboflow :

### Caractéristiques du modèle
- **Dataset** : CubiCasa5K - 5000 plans architecturaux annotés
- **Classes détectées** :
  - `mur` - Murs et cloisons
  - `porte` - Portes et ouvertures
  - `fenêtre` - Fenêtres et baies vitrées  
  - `pièce` - Espaces et pièces

### Performance
- **Précision moyenne** : >85% sur les éléments principaux
- **Temps de traitement** : 2-5 secondes par plan
- **Formats supportés** : JPG, PNG, PDF (converti)

### API Roboflow
- **Endpoint** : `https://detect.roboflow.com/`
- **Authentification** : Clé API dans les headers
- **Format de réponse** : JSON avec coordonnées et confiance

## 📖 Utilisation

1. **Connexion** : Authentifiez-vous avec votre compte
2. **Import** : Cliquez sur "Importer un plan" et sélectionnez votre fichier
3. **Analyse** : Cliquez sur "Analyser le plan" pour lancer la détection IA
4. **Visualisation** : Les éléments détectés apparaissent dans le tableau
5. **Sélection** : Cliquez sur une ligne pour visualiser l'élément sur le plan
6. **Export** : Sauvegardez les résultats en JSON

## 🛠️ Commandes Utiles

### Gestion des processus
```bash
# Arrêter le backend
pkill -f "uvicorn main:app"

# Arrêter le frontend  
pkill -f "npm run dev"

# Vérifier les processus actifs
ps aux | grep -E "(uvicorn|npm)"
```

### Scripts de lancement
```bash
# Lancer le backend
./start-backend.sh

# Lancer le frontend
./start-frontend.sh
```

## 📁 Structure du Projet

```
FloorIA/
├── backend/                 # API Python/FastAPI
│   ├── main.py             # Point d'entrée de l'API
│   ├── auth_middleware.py  # Authentification
│   ├── geometry_processor.py # Traitement géométrique
│   ├── supabase_client.py  # Client Supabase
│   ├── requirements.txt    # Dépendances Python
│   └── .env.example       # Template de configuration
├── frontend/               # Application Vue.js
│   ├── src/
│   │   ├── components/    # Composants Vue
│   │   ├── types/         # Types TypeScript
│   │   └── utils/         # Utilitaires
│   ├── package.json       # Dépendances Node.js
│   └── vite.config.ts     # Configuration Vite
├── supabase/              # Configuration Supabase
├── README.md              # Cette documentation
├── AUTHENTICATION.md      # Guide d'authentification
└── .gitignore            # Fichiers ignorés par Git
```

## 🔧 Développement

### Mode Test
Ajoutez `?modetest` à l'URL pour accéder aux outils de développement :
```
http://localhost:3000?modetest
```

### Hot Reload
- **Backend** : `--reload` active le rechargement automatique
- **Frontend** : Vite recharge automatiquement les modifications

### Debugging
- **Backend** : Logs détaillés dans la console
- **Frontend** : DevTools Vue.js disponibles
- **API** : Documentation automatique sur `/docs`

## 📝 Documentation Additionnelle

- `AUTHENTICATION.md` - Configuration Supabase et authentification
- `CORS_TROUBLESHOOTING.md` - Résolution des problèmes CORS
- `RENDER_DEPLOYMENT.md` - Déploiement sur Render

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

Développé par Deep-5 avec ❤️

---

**FloorIA** - Transformez vos plans architecturaux en données structurées grâce à l'IA
