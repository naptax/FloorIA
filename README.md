# 🎯 Vectorizator

Une application d'analyse d'images avec IA composée d'un frontend Node.js/Vite et d'un backend Python utilisant Shapely pour le traitement géométrique et l'API Roboflow pour la détection d'objets.

## 🏗️ Architecture

- **Frontend**: Node.js avec Vite pour une interface utilisateur moderne
- **Backend**: Python avec FastAPI, Shapely pour la géométrie, et intégration Roboflow
- **Fonctionnalités**: Upload d'images, détection d'objets IA, superposition de bounding boxes, contrôle d'opacité

## 📁 Structure du Projet

```
Vectorizator/
├── frontend/
│   ├── index.html          # Interface utilisateur principale
│   ├── main.js             # Logique frontend et interactions
│   ├── package.json        # Dépendances Node.js
│   └── vite.config.js      # Configuration Vite
├── backend/
│   ├── main.py             # API FastAPI principale
│   ├── roboflow_client.py  # Client pour l'API Roboflow
│   ├── geometry_processor.py # Traitement géométrique avec Shapely
│   ├── requirements.txt    # Dépendances Python
│   └── .env.example        # Variables d'environnement
└── README.md
```

## 🚀 Installation et Configuration

### Backend (Python)

1. Créer un environnement virtuel:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

2. Installer les dépendances:
```bash
pip install -r requirements.txt
```

3. Configurer les variables d'environnement:
```bash
cp .env.example .env
# Éditer .env avec vos clés API Roboflow
```

4. Lancer le serveur backend:
```bash
python main.py
```
Le backend sera accessible sur `http://localhost:8000`

### Frontend (Node.js/Vite)

1. Installer les dépendances:
```bash
cd frontend
npm install
```

2. Lancer le serveur de développement:
```bash
npm run dev
```
Le frontend sera accessible sur `http://localhost:3000`

## 🔧 Configuration Roboflow

**IMPORTANT**: Vous devez fournir le code Python spécifique pour l'intégration Roboflow.

1. Créer un fichier `.env` dans le dossier `backend/`
2. Ajouter vos clés API Roboflow:
```
ROBOFLOW_API_KEY=votre_clé_api_ici
ROBOFLOW_MODEL_ENDPOINT=votre_endpoint_modèle_ici
```

3. Remplacer le code placeholder dans `roboflow_client.py` avec votre code spécifique.

## 🎮 Utilisation

1. Ouvrir l'application dans votre navigateur (`http://localhost:3000`)
2. Glisser-déposer une image ou cliquer pour sélectionner un fichier
3. L'image sera analysée par l'API Roboflow
4. Les bounding boxes seront superposées sur l'image
5. Utiliser le curseur d'opacité pour ajuster la transparence de l'image de fond
6. Cliquer sur "Reset" pour analyser une nouvelle image

## 🔍 Fonctionnalités

- **Upload d'images**: Glisser-déposer ou sélection de fichiers
- **Détection d'objets**: Intégration avec l'API Roboflow
- **Traitement géométrique**: Utilisation de Shapely pour les calculs géométriques
- **Visualisation**: Superposition de bounding boxes avec étiquettes et scores de confiance
- **Contrôle d'opacité**: Ajustement de la transparence de l'image de fond
- **Interface moderne**: Design responsive avec animations

## 🛠️ Technologies Utilisées

### Frontend
- **Vite**: Build tool moderne et rapide
- **Vanilla JavaScript**: Logique frontend pure
- **HTML5 Canvas**: Rendu des bounding boxes
- **CSS3**: Styling moderne avec gradients et animations

### Backend
- **FastAPI**: Framework web Python moderne
- **Shapely**: Manipulation et analyse géométrique
- **Pillow**: Traitement d'images
- **Uvicorn**: Serveur ASGI
- **python-dotenv**: Gestion des variables d'environnement

## 📝 API Endpoints

- `GET /`: Status de l'API
- `POST /analyze`: Analyse d'image (upload + détection)
- `GET /health`: Vérification de santé

## 🔄 Prochaines Étapes

1. **Fournir le code Roboflow**: Remplacer le code placeholder avec votre implémentation
2. **Tester l'intégration**: Vérifier que l'API fonctionne correctement
3. **Personnaliser**: Ajuster les couleurs, styles, et fonctionnalités selon vos besoins

## 🐛 Dépannage

- Vérifier que les deux serveurs (frontend et backend) sont en cours d'exécution
- S'assurer que les clés API Roboflow sont correctement configurées
- Vérifier les logs du serveur pour les erreurs
- Tester avec des images de différents formats (JPEG, PNG)

## 📄 Licence

Ce projet est développé pour l'analyse d'images avec IA et le traitement géométrique.