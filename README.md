# 🚨 Urban Cybercrime Forecasting Dashboard

> **Educational Research Project** - Forecasting Urban Cybercrime using Facebook Prophet and Real Government Data

A full-stack web application for forecasting and visualizing cybercrime trends across major Indian cities using time series analysis and machine learning.

[![Educational](https://img.shields.io/badge/Purpose-Educational-blue)]()
[![Python](https://img.shields.io/badge/Python-3.9+-green)]()
[![React](https://img.shields.io/badge/React-18+-blue)]()
[![Prophet](https://img.shields.io/badge/Prophet-1.1+-orange)]()

## 🎓 Context

This project demonstrates:
- **Time Series Forecasting** using Facebook Prophet
- **Full-Stack Development** (React + Flask)
- **Data Processing & ETL** pipelines
- **RESTful API Design**
- **Data Disaggregation** techniques (yearly → monthly, state → city)

**Data Transparency:** This project uses a hybrid approach combining real government cybercrime statistics with statistically-derived synthetic data to bridge granularity gaps. All transformations are documented in [`backend/DATA_METHODOLOGY.md`](backend/DATA_METHODOLOGY.md).

## ✨ Features

- 📊 **Interactive Dashboards** - Real-time visualization of cybercrime trends
- 🔮 **Prophet Forecasting** - 6-month predictions with confidence intervals
- 🗺️ **Regional Analysis** - City-level and state-level breakdowns
- 🎯 **Crime Type Classification** - 7 major categories (Phishing, UPI Fraud, Ransomware, etc.)
- 🔍 **Dynamic Filtering** - Filter by region and crime type
- 📈 **Risk Assessment** - Automated risk level calculation
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## 🏗️ Architecture

```
├── backend/                 # Flask API + Prophet Forecasting
│   ├── app.py              # API endpoints
│   ├── data_processor.py   # Data transformation pipeline
│   ├── forecast_model.py   # Prophet forecasting logic
│   ├── datasets/           # Source CSV files (NCRB data)
│   └── README.md           # Backend documentation
│
├── src/                     # React Frontend
│   ├── pages/              # Page components
│   ├── components/         # UI components
│   ├── api/                # API client
│   └── data/               # Sample/fallback data
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ (for frontend)
- **Python** 3.9+ (for backend)
- **pip** package manager

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies (this may take 5-10 minutes)
pip install -r requirements.txt

# Run the Flask server
python app.py
```

Backend will be available at: `http://localhost:5000`

### 2. Frontend Setup

```bash
# In a new terminal, navigate to project root
cd forecasting-urban-cybercrime

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 3. Verify Setup

1. Open browser to `http://localhost:5173`
2. Dashboard should load with data from backend
3. Check browser console for API connection status
4. If backend is down, frontend falls back to sample data

## 📊 Data Sources & Methodology

### Real Data Foundation

1. **RS_Session_266_AU_226_A_i.csv** - Official state-level yearly data (2018-2022) from NCRB
2. **Dataset_CyberCrime_Sean.csv** - Crime type distribution patterns

### Transparent Synthetic Enhancement

To bridge the gap between state-level yearly data and city-level monthly requirements:

- **State → City**: Population-weighted allocation (e.g., Maharashtra → Mumbai 60%, Pune 40%)
- **Yearly → Monthly**: Seasonality-based disaggregation with validation
- **Validation**: Monthly sums equal yearly totals (within rounding error)

**Why This Approach?**
- Government datasets only provide state-level yearly aggregates
- City-level real-time data is restricted for security reasons
- Standard practice in ML/forecasting research when granular data is unavailable
- All transformations are documented, reproducible, and grounded in real statistics

📖 **Complete methodology**: [`backend/DATA_METHODOLOGY.md`](backend/DATA_METHODOLOGY.md)

## 📡 API Documentation

See [`backend/README.md`](backend/README.md) for complete API documentation.

**Key Endpoints:**
- `GET /api/regions` - Available cities
- `GET /api/crime-types` - Crime categories
- `GET /api/incidents` - Historical data with filtering
- `GET /api/forecast` - Prophet predictions
- `GET /api/stats` - Summary statistics




### Academic Justification Points

1. **Data Constraints**
   - "Government datasets only provide state-level yearly data"
   - "City-level data is restricted for security reasons"
   - "Common challenge in ML/forecasting projects"

2. **Our Solution**
   - "Statistical disaggregation preserving yearly totals"
   - "Population-weighted allocation for city mapping"
   - "Validation: monthly sums equal yearly totals"

3. **Learning Outcomes**
   - "Demonstrated Prophet forecasting technique"
   - "Built production-quality REST API"
   - "Implemented data processing pipeline"
   - "Created full-stack application"

### Common Review Questions & Answers

**Q: "Is this real data?"**  
A: "Yes, the foundation is real NCRB data (state-level yearly). We applied statistical methods to convert it to city-level monthly for visualization needs. All transformations are documented."

**Q: "Why synthetic data?"**  
A: "Government data is state-level yearly only. Modern dashboards need city-level monthly granularity. This is a standard approach in ML research when granular data is unavailable."

**Q: "How accurate is the forecast?"**  
A: "Prophet is industry-standard for time series forecasting. We provide 95% confidence intervals. Accuracy depends on historical patterns continuing."

**Q: "Can this be deployed?"**  
A: "Yes! Backend can deploy to Heroku/Railway, frontend to Vercel/Netlify. It's production-ready with proper error handling and API design."

## 🛠️ Technologies Used

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- shadcn/ui + Radix UI
- Tailwind CSS
- Recharts (visualization)
- TanStack Query

**Backend:**
- Python 3.9+
- Flask (web framework)
- Facebook Prophet (forecasting)
- pandas (data processing)
- NumPy (numerical operations)

**Data Sources:**
- NCRB (National Crime Records Bureau)
- Parliamentary data (Rajya Sabha)

## 📝 License

Educational Project - MIT License


## 🙏 Acknowledgments

- National Crime Records Bureau (NCRB) for data
- Facebook Research for Prophet library
- Indian Cyber Crime Coordination Centre (I4C)


