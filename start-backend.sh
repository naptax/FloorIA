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
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de la création de l'environnement virtuel."
        echo "   Assurez-vous que python3-venv est installé: sudo apt install python3-venv"
        exit 1
    fi
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Vérifier que l'activation a fonctionné
if [ "$VIRTUAL_ENV" = "" ]; then
    echo "❌ Erreur: L'environnement virtuel n'a pas pu être activé."
    exit 1
fi

# Installer les dépendances
echo "📥 Installation des dépendances..."
pip install -r requirements.txt

# Si l'installation échoue à cause de l'environnement externally-managed
if [ $? -ne 0 ]; then
    echo "⚠️  Installation échouée. Tentative avec --break-system-packages..."
    pip install -r requirements.txt --break-system-packages
    
    if [ $? -ne 0 ]; then
        echo "❌ Impossible d'installer les dépendances."
        echo "   Solutions possibles:"
        echo "   1. Utilisez pipx: pipx install <package>"
        echo "   2. Installez python3-venv: sudo apt install python3-venv python3-full"
        echo "   3. Utilisez un gestionnaire de paquets système"
        exit 1
    fi
fi

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Attention: Le fichier .env n'existe pas."
    echo "   Copiez .env.example vers .env et configurez vos variables d'environnement."
    if [ -f ".env.example" ]; then
        echo "   Commande: cp .env.example .env"
    fi
fi

# Vérification finale que le venv est bien activé
echo "✅ Environnement virtuel activé: $VIRTUAL_ENV"
echo "✅ Python utilisé: $(which python)"

# Démarrer le serveur avec uvicorn et hot reload
echo "🌟 Démarrage du serveur backend sur http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo "   Health Check: http://localhost:8000/health"
echo "   Hot reload activé pour le développement"
echo "   Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
