#!/bin/bash

# FlowAI - Quick Start Script
# This script sets up and runs the entire application

echo "🚀 FlowAI - Starting Application..."
echo "=================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL detected"

# Backend setup
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "🗄️  Running database migrations..."
npm run migrate

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed. Check your PostgreSQL connection."
    exit 1
fi

echo "✅ Backend ready!"

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "✅ Frontend ready!"

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Open Terminal 1 and run:   cd backend && npm run dev"
echo "2. Open Terminal 2 and run:   cd frontend && npm start"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo "=================================="
