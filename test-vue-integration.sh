#!/bin/bash

# Script pour tester l'intégration Vue.js + Vite dans FloorIA
echo "🧪 Test d'intégration Vue.js + Vite pour FloorIA..."

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

# Vérifier les dépendances Vue.js
echo "📦 Vérification des dépendances Vue.js..."
if ! npm list vue > /dev/null 2>&1; then
    echo "❌ Vue.js n'est pas installé. Installation..."
    npm install vue@latest @vitejs/plugin-vue@latest
fi

if ! npm list vue-tsc > /dev/null 2>&1; then
    echo "❌ vue-tsc n'est pas installé. Installation..."
    npm install --save-dev vue-tsc@latest
fi

# Test de compilation TypeScript avec Vue
echo "🔍 Test de compilation TypeScript + Vue..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Erreur de compilation TypeScript + Vue"
    exit 1
fi

echo "✅ Compilation TypeScript + Vue réussie"

# Test de build
echo "🏗️  Test de build Vue.js + Vite..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur de build Vue.js + Vite"
    exit 1
fi

echo "✅ Build Vue.js + Vite réussi"

# Vérifier que les fichiers de test Vue existent
echo "📁 Vérification des fichiers de test Vue.js..."
if [ ! -f "src/App.vue" ]; then
    echo "❌ Fichier App.vue manquant"
    exit 1
fi

if [ ! -f "src/main-vue.ts" ]; then
    echo "❌ Fichier main-vue.ts manquant"
    exit 1
fi

if [ ! -f "index-vue.html" ]; then
    echo "❌ Fichier index-vue.html manquant"
    exit 1
fi

echo "✅ Tous les fichiers de test Vue.js sont présents"

echo ""
echo "🎉 SUCCÈS: L'intégration Vue.js + Vite est prête!"
echo ""
echo "📋 Résumé des tests:"
echo "   ✅ Dépendances Vue.js installées"
echo "   ✅ Configuration Vite + Vue fonctionnelle"
echo "   ✅ Compilation TypeScript + Vue réussie"
echo "   ✅ Build Vue.js + Vite réussi"
echo "   ✅ Fichiers de test créés"
echo ""
echo "🚀 Pour tester l'application Vue.js:"
echo "   ./start-vue-test.sh"
echo ""
echo "🔄 Pour revenir à l'application TypeScript actuelle:"
echo "   ./start-frontend.sh"
