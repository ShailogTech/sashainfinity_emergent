#!/bin/bash

echo "🔐 SashaInfinity Authentication System Setup"
echo "============================================"

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if ! mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    echo "   On Windows: net start MongoDB"
    echo "   On Mac: brew services start mongodb-community"
    echo "   On Linux: sudo systemctl start mongod"
    exit 1
fi
echo "✅ MongoDB is running"

# Check if backend .env exists
echo "📝 Checking backend configuration..."
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOF
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=sashainfinity_lms

# JWT Configuration
JWT_SECRET_KEY=$(openssl rand -hex 32)

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://sashainfinity.com
EOF
    echo "✅ Created backend/.env file"
else
    echo "✅ backend/.env file exists"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if ! pip install -r requirements.txt > /dev/null 2>&1; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if ! yarn install > /dev/null 2>&1; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"
cd ..

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
echo "✅ Logs directory created"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && python -m uvicorn server:app --reload --port 8000"
echo ""
echo "2. Start the frontend server (in a new terminal):"
echo "   cd frontend && yarn start"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "4. Test the authentication system:"
echo "   python scripts/test_auth.py"
echo ""
echo "📚 For more information, see docs/AUTHENTICATION_GUIDE.md"