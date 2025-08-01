#!/bin/bash

# 🔐 FloorIA Environment Setup Script
# This script helps you set up your environment variables securely

echo "🚀 FloorIA Environment Setup"
echo "=================================="
echo ""

# Check if .env already exists
if [ -f "backend/.env" ]; then
    echo "⚠️  .env file already exists in backend/"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
fi

# Copy template
echo "📋 Copying .env template..."
cp backend/.env.example backend/.env

echo "✅ Template copied to backend/.env"
echo ""
echo "🔑 Now you need to edit backend/.env with your actual Roboflow API key:"
echo ""
echo "   ROBOFLOW_API_KEY=your_actual_api_key_here"
echo ""
echo "🔐 SECURITY REMINDER:"
echo "   • The .env file is automatically excluded from git"
echo "   • Never commit your actual API key to the repository"
echo "   • Keep your API key secure and don't share it"
echo ""
echo "📝 To edit the .env file, run:"
echo "   nano backend/.env"
echo "   # or"
echo "   code backend/.env"
echo ""
echo "🎯 Once configured, start the application with:"
echo "   cd backend && python -m uvicorn main:app --reload"
echo "   cd frontend && npm run dev"
echo ""
echo "✨ Setup complete! Remember to add your API key to backend/.env"
