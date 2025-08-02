#!/bin/bash

# Script pour démarrer le test Vue.js dans FloorIA
echo "🚀 Démarrage du test Vue.js + Vite pour FloorIA..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "frontend" ]; then
    echo "❌ Erreur: Le répertoire 'frontend' n'existe pas."
    echo "   Assurez-vous d'exécuter ce script depuis la racine du projet FloorIA."
    exit 1
fi

# Activer l'environnement virtuel du backend (requis pour toutes les opérations)
echo "🔧 Activation de l'environnement virtuel..."
source backend/venv/bin/activate

# Vérifier que l'activation a fonctionné
if [ "$VIRTUAL_ENV" = "" ]; then
    echo "❌ Erreur: L'environnement virtuel n'a pas pu être activé."
    echo "   Assurez-vous que le venv existe dans backend/venv/"
    exit 1
fi

echo "✅ Environnement virtuel activé: $VIRTUAL_ENV"

# Aller dans le répertoire frontend
cd frontend

# Vérifier si le fichier de test Vue existe
if [ ! -f "index-vue.html" ]; then
    echo "❌ Erreur: Le fichier index-vue.html n'existe pas."
    echo "   Exécutez d'abord: ./test-vue-integration.sh"
    exit 1
fi

# Sauvegarder temporairement l'index.html actuel
if [ -f "index.html" ]; then
    echo "💾 Sauvegarde de index.html vers index-original.html"
    cp index.html index-original.html
fi

# Utiliser le fichier Vue pour le test
echo "🔄 Basculement vers la configuration Vue.js..."
cp index-vue.html index.html

# Démarrer le serveur de développement Vue.js
echo "🌟 Démarrage du serveur Vue.js sur http://localhost:3000"
echo "   Test d'intégration Vue.js + Vite"
echo "   Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""
echo "🧪 Une fois le test terminé, restaurez l'application originale avec:"
echo "   ./restore-original-frontend.sh"
echo ""

# Fonction de nettoyage lors de l'arrêt
cleanup() {
    echo ""
    echo "🔄 Nettoyage en cours..."
    if [ -f "index-original.html" ]; then
        echo "📁 Restauration de index.html original"
        mv index-original.html index.html
    fi
    echo "✅ Nettoyage terminé"
}

# Capturer Ctrl+C pour nettoyer
trap cleanup EXIT

npm run dev
