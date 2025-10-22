@echo off
REM Quick start script for Flask backend (Windows)

echo ==========================================
echo Urban Cybercrime Forecasting - Backend
echo ==========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
if not exist "venv\installed.flag" (
    echo Installing dependencies (this may take 5-10 minutes)...
    pip install -r requirements.txt
    echo. > venv\installed.flag
    echo Dependencies installed
)

echo.
echo Starting Flask server...
echo API will be available at: http://localhost:5000
echo.
python app.py

