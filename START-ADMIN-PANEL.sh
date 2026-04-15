#!/bin/bash

echo "================================"
echo "SashaInfinity Admin Panel Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/server.py" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Installing Backend Dependencies..."
cd backend
pip install python-dotenv fastapi uvicorn motor pydantic

echo ""
echo "Step 2: Creating Backend .env file..."
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=sashainfinity_db
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
EOF

echo ""
echo "Step 3: Starting Backend Server..."
python -m uvicorn server:app --reload --port 8000 &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

# Test backend
echo "Testing backend..."
curl -s http://localhost:8000/api/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend started successfully on http://localhost:8000"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "Step 4: Installing Frontend Dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take a while)..."
    yarn install
fi

echo ""
echo "Step 5: Starting Frontend Server..."
yarn start &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "✅ Admin Panel Ready!"
echo "================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000/api"
echo "Admin Panel: http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
