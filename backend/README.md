# Urban Cybercrime Forecasting - Backend API

Flask-based backend API for the Urban Cybercrime Forecasting Dashboard, implementing Facebook Prophet time series forecasting on processed government cybercrime data.

## 🎓 Academic Context

This project is developed for educational and demonstration purposes as part of a college research project. The implementation showcases:

- **Time Series Forecasting** using Facebook Prophet
- **RESTful API Design** with Flask
- **Data Processing & ETL** pipelines
- **Statistical Data Disaggregation** techniques

## 📊 Data Sources

### Real Data (Foundation)

1. **RS_Session_266_AU_226_A_i.csv**
   - Source: Official state-level cybercrime statistics (2018-2022)
   - Type: Yearly aggregates by Indian state/UT
   - Usage: Primary data for yearly totals and trends

2. **Dataset_CyberCrime_Sean.csv**
   - Source: Crime type distribution patterns
   - Type: Breakdown by motivation/category
   - Usage: Real crime type proportions

### Synthetic Components (Derived)

**Why Synthetic Data?**
- Government datasets provide state-level yearly data only
- Modern dashboards require city-level monthly granularity
- Real-time city-level data is restricted for security reasons
- **Standard practice** in academic ML/forecasting projects

**Our Transparent Approach:**
1. **Yearly Totals Preserved**: Real state-level totals from NCRB maintained
2. **Statistical Disaggregation**: Yearly → Monthly using seasonality patterns
3. **Population-Weighted Allocation**: State → City using demographic data
4. **Validation**: Monthly sums equal yearly totals (within rounding error)

See [DATA_METHODOLOGY.md](./DATA_METHODOLOGY.md) for detailed transformation pipeline.


## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns API status.

### Available Regions
```
GET /api/regions
```
Returns list of available cities (Mumbai, Delhi NCR, Bangalore, etc.)

### Available Crime Types
```
GET /api/crime-types
```
Returns list of crime categories (Phishing, UPI Fraud, etc.)

### Historical Incidents
```
GET /api/incidents?region={region}&crime_type={type}&format={format}
```

**Parameters:**
- `region`: City name or "All Regions" (default: "All Regions")
- `crime_type`: Specific type or "All Types" (default: "All Types")
- `format`: "trend" | "crime-type" | "regional"

**Example:**
```bash
curl "http://localhost:5000/api/incidents?region=Mumbai&format=trend"
```

### Forecast Data
```
GET /api/forecast?region={region}&periods={n}&crime_type={type}
```

**Parameters:**
- `region`: City name or "All Regions" (default: "All Regions")
- `periods`: Number of months to forecast (1-24, default: 6)
- `crime_type`: Optional - forecast specific crime type

**Example:**
```bash
curl "http://localhost:5000/api/forecast?region=Bangalore&periods=6"
```

**Response Format:**
```json
[
  {
    "date": "2024-10",
    "actual": 307,
    "predicted": 305,
    "lower": 285,
    "upper": 325
  },
  {
    "date": "2025-01",
    "actual": null,
    "predicted": 325,
    "lower": 300,
    "upper": 350
  }
]
```

### Summary Statistics
```
GET /api/stats?region={region}&crime_type={type}
```

Returns aggregated statistics including total incidents, most common crime type, risk level, and forecast summary.

### Clear Cache
```
POST /api/clear-cache
```
Clears cached forecast data (useful for development).

## 🔬 Technical Details

### Prophet Forecasting

The backend uses Facebook Prophet with optimized parameters:

- **Seasonality Mode**: Multiplicative (better for growing trends)
- **Changepoint Prior Scale**: 0.05 (moderate flexibility)
- **Interval Width**: 95% (confidence intervals)
- **Yearly Seasonality**: Enabled
- **Weekly/Daily**: Disabled (monthly data)

### Data Processing Pipeline

1. **Load**: Read CSV files from `datasets/`
2. **Map**: State → City using population weights
3. **Disaggregate**: Yearly → Monthly with seasonality
4. **Enhance**: Add crime type breakdown from real proportions
5. **Validate**: Ensure monthly totals = yearly totals
6. **Cache**: Store processed data in memory




### Why This Approach is Valid

1. **Data Availability Constraints**
   - Government data: State-level yearly only
   - City-level: Restricted for security
   - Industry standard for ML research

2. **Educational Focus**
   - Demonstrates forecasting methodology ✓
   - Shows API development best practices ✓
   - Exhibits data processing pipelines ✓

3. **Grounded in Reality**
   - Real yearly totals preserved
   - Actual crime type distributions
   - Statistical disaggregation methods
   - Reproducible & documented

4. **Transparent Implementation**
   - Clear code comments
   - Validation checks
   - Open methodology
   - Academic honesty


## 📝 License & Attribution

**Educational Project** - Developed for academic demonstration purposes.

**Data Sources:**
- National Crime Records Bureau (NCRB) - State-level statistics
- Government of India cybercrime data

**Technologies:**
- Facebook Prophet (forecasting)
- Flask (web framework)
- pandas (data processing)

