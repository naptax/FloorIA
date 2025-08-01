#!/bin/bash

# Script pour démarrer le frontend FloorIA
echo "🚀 Démarrage du frontend FloorIA..."

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

# Démarrer le serveur de développement
echo "🌟 Démarrage du serveur frontend sur http://localhost:3000"
echo "   Le navigateur devrait s'ouvrir automatiquement"
echo "   Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm run dev
