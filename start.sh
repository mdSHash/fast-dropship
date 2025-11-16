#!/bin/bash

# Fast-Dropship Quick Start Script

echo "🚀 Fast-Dropship Quick Start"
echo "=============================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update SECRET_KEY in backend/.env before production use"
fi

echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp .env.example .env.local
fi

echo "✅ Frontend setup complete"
echo ""

# Instructions
echo "🎉 Setup Complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more details, see SETUP.md"

# Made with Bob
