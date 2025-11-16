#!/bin/bash

echo "🔄 Resetting database and running migration..."
echo ""

# Remove existing database
if [ -f "fastdropship.db" ]; then
    echo "📦 Removing existing database..."
    rm fastdropship.db
    echo "✓ Database removed"
else
    echo "ℹ️  No existing database found"
fi

echo ""
echo "🌱 Running seed script to create fresh database..."
python3 seed_data.py

echo ""
echo "✅ Database reset complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend: uvicorn app.main:app --reload"
echo "2. Start the frontend: cd ../frontend && npm run dev"
echo "3. Login with: admin@fastdropship.com / admin123"

# Made with Bob