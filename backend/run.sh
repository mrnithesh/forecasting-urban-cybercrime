#!/bin/bash
# Quick start script for Flask backend (Unix/macOS)

echo "=========================================="
echo "Urban Cybercrime Forecasting - Backend"
echo "=========================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if [ ! -f "venv/installed.flag" ]; then
    echo "Installing dependencies (this may take 5-10 minutes)..."
    pip install -r requirements.txt
    touch venv/installed.flag
    echo "✓ Dependencies installed"
fi

echo ""
echo "Starting Flask server..."
echo "API will be available at: http://localhost:5000"
echo ""
python app.py

