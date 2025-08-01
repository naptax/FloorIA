#!/bin/bash

# Script pour démarrer le backend FloorIA
echo "🚀 Démarrage du backend FloorIA..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "backend" ]; then
    echo "❌ Erreur: Le répertoire 'backend' n'existe pas."
    echo "   Assurez-vous d'exécuter ce script depuis la racine du projet FloorIA."
    exit 1
fi

# Aller dans le répertoire backend
cd backend

# Vérifier si le fichier requirements.txt existe
if [ ! -f "requirements.txt" ]; then
    echo "❌ Erreur: Le fichier requirements.txt n'existe pas dans le répertoire backend."
    exit 1
fi

# Vérifier si l'environnement virtuel existe
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Installer les dépendances
echo "📥 Installation des dépendances..."
pip install -r requirements.txt

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Attention: Le fichier .env n'existe pas."
    echo "   Copiez .env.example vers .env et configurez vos variables d'environnement."
    if [ -f ".env.example" ]; then
        echo "   Commande: cp .env.example .env"
    fi
fi

# Démarrer le serveur
echo "🌟 Démarrage du serveur backend sur http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo "   Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

python main.py
