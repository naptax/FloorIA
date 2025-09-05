#!/bin/bash

# Script pour démarrer le frontend FloorIA Vue.js
echo "🚀 Démarrage du frontend FloorIA Vue.js 3..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "frontend" ]; then
    echo "❌ Erreur: Le répertoire 'frontend' n'existe pas."
    echo "   Assurez-vous d'exécuter ce script depuis la racine du projet FloorIA."
    exit 1
fi

# Aller dans le répertoire frontend
cd frontend

# Vérifier si le fichier package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Le fichier package.json n'existe pas dans le répertoire frontend."
    exit 1
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Erreur: Node.js n'est pas installé."
    echo "   Installez Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ Erreur: npm n'est pas installé."
    echo "   npm devrait être installé avec Node.js."
    exit 1
fi

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances npm..."
    npm install
else
    echo "✅ Les dépendances npm sont déjà installées."
fi

# Activer l'environnement virtuel du backend (requis pour toutes les opérations)
echo "🔧 Activation de l'environnement virtuel..."
source ../backend/venv/bin/activate

# Vérifier que l'activation a fonctionné
if [ "$VIRTUAL_ENV" = "" ]; then
    echo "❌ Erreur: L'environnement virtuel n'a pas pu être activé."
    echo "   Assurez-vous que le venv existe dans backend/venv/"
    exit 1
fi

echo "✅ Environnement virtuel activé: $VIRTUAL_ENV"

# Démarrer le serveur de développement Vue.js
echo "🌟 Démarrage du serveur Vue.js (port automatique: 3001+)"
echo "   Interface Vue.js 3 avec Composition API"
echo "   Environnement: DEVELOPMENT (.env.local)"
echo "   Backend: http://localhost:8000"
echo "   Mode test disponible avec: ?modetest"
echo "   Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm run dev
