"""
Prophet Forecasting Module for Urban Cybercrime

This module implements Facebook Prophet time series forecasting
to predict future cybercrime incidents based on historical data.

Key Features:
- Automatic seasonality detection
- Trend analysis
- Confidence intervals
- Multi-region support
"""

import pandas as pd
import numpy as np
from prophet import Prophet
import warnings
from datetime import datetime, timedelta

warnings.filterwarnings('ignore')


class CybercrimeForecaster:
    # Time series forecasting using Facebook Prophet
    
    def __init__(self):
        self.models = {}  # Cache trained models by region
        self.forecasts = {}  # Cache forecasts
        
    def prepare_prophet_data(self, incident_data):
        """
        Prepare data in Prophet's required format (ds, y)
        
        Args:
            incident_data: DataFrame with 'date' and 'incidents' columns
            
        Returns:
            DataFrame with 'ds' (datetime) and 'y' (values) columns
        """
        df = incident_data.copy()
        
        # Prophet requires columns named 'ds' (datestamp) and 'y' (value)
        df['ds'] = pd.to_datetime(df['date'])
        df['y'] = df['incidents'].astype(float)
        
        # Select only required columns
        prophet_df = df[['ds', 'y']].sort_values('ds')
        
        return prophet_df
    
    def train_and_forecast(self, historical_data, periods=6, freq='M'):
        """
        Train Prophet model and generate forecasts
        
        Args:
            historical_data: DataFrame with incident data
            periods: Number of future periods to forecast (default: 6 months)
            freq: Frequency of forecast ('M' for monthly, 'D' for daily)
            
        Returns:
            DataFrame with forecast including yhat, yhat_lower, yhat_upper
        """
        # Prepare data
        prophet_df = self.prepare_prophet_data(historical_data)
        
        if len(prophet_df) < 12:
            print(f"⚠ Warning: Only {len(prophet_df)} data points. Prophet works best with 12+ points.")
        
        # Initialize Prophet model with optimized parameters
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,  # Monthly data doesn't need weekly
            daily_seasonality=False,
            seasonality_mode='multiplicative',  # Better for growing trends
            changepoint_prior_scale=0.05,  # Flexibility in trend changes
            interval_width=0.95  # 95% confidence intervals
        )
        
        # Train the model
        print(f"Training Prophet model on {len(prophet_df)} data points...")
        model.fit(prophet_df)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=periods, freq=freq)
        
        # Generate forecast
        forecast = model.predict(future)
        
        print(f"✓ Forecast generated for {periods} future periods")
        
        return forecast, model
    
    def format_forecast_for_frontend(self, forecast, historical_data, periods=6):
        """
        Format Prophet forecast for frontend consumption
        Includes last 3 months of actual data + forecast
        
        Args:
            forecast: Prophet forecast DataFrame
            historical_data: Original historical data
            periods: Number of future periods
            
        Returns:
            List of dicts with date, actual, predicted
        """
        result = []
        
        # Get last few months of historical data for comparison
        historical_df = self.prepare_prophet_data(historical_data)
        historical_df = historical_df.sort_values('ds').tail(3)
        
        # Add historical actuals with predictions (for validation)
        # Using a set to track processed dates to avoid duplicates
        processed_dates = set()
        
        for _, row in historical_df.iterrows():
            date_str = row['ds'].strftime('%Y-%m')
            
            if date_str in processed_dates:
                continue
                
            processed_dates.add(date_str)
            actual = int(row['y'])
            
            # Find corresponding prediction
            pred_row = forecast[forecast['ds'] == row['ds']]
            predicted = int(pred_row['yhat'].values[0]) if not pred_row.empty else actual
            
            result.append({
                'date': date_str,
                'actual': actual,
                'predicted': predicted,
                'lower': int(pred_row['yhat_lower'].values[0]) if not pred_row.empty else None,
                'upper': int(pred_row['yhat_upper'].values[0]) if not pred_row.empty else None
            })
        
        # Add future forecasts (no actuals)
        # Filter out dates that we already processed in historical section
        future_forecasts = forecast.tail(periods)
        
        for _, row in future_forecasts.iterrows():
            date_str = row['ds'].strftime('%Y-%m')
            
            if date_str in processed_dates:
                continue
            
            processed_dates.add(date_str)
            
            result.append({
                'date': date_str,
                'actual': None,
                'predicted': max(0, int(row['yhat'])),  # Ensure non-negative
                'lower': max(0, int(row['yhat_lower'])),
                'upper': max(0, int(row['yhat_upper']))
            })
        
        return result
    
    def forecast_by_region(self, data_processor, region="All Regions", periods=6):
        """
        Generate forecast for a specific region
        
        Args:
            data_processor: DataProcessor instance
            region: City name or "All Regions"
            periods: Number of months to forecast
            
        Returns:
            Formatted forecast data for frontend
        """
        # Check cache
        cache_key = f"{region}_{periods}"
        if cache_key in self.forecasts:
            print(f"✓ Using cached forecast for {region}")
            return self.forecasts[cache_key]
        
        # Get historical data
        historical_data = data_processor.get_incidents_by_region(region)
        
        if historical_data.empty:
            print(f"⚠ No data available for {region}")
            return []
        
        print(f"\nForecasting for: {region}")
        print(f"Historical data points: {len(historical_data)}")
        
        # Train and forecast
        forecast, model = self.train_and_forecast(historical_data, periods=periods)
        
        # Format for frontend
        formatted_forecast = self.format_forecast_for_frontend(
            forecast, historical_data, periods
        )
        
        # Cache the result
        self.forecasts[cache_key] = formatted_forecast
        self.models[cache_key] = model
        
        return formatted_forecast
    
    def forecast_by_crime_type(self, data_processor, crime_type, region="All Regions", periods=6):
        """
        Generate forecast for a specific crime type
        
        Args:
            data_processor: DataProcessor instance
            crime_type: Specific crime type to forecast
            region: City name or "All Regions"
            periods: Number of months to forecast
            
        Returns:
            Formatted forecast data for frontend
        """
        # Get historical data
        historical_data = data_processor.get_incidents_by_region(region)
        
        if crime_type not in historical_data.columns:
            print(f"⚠ Crime type '{crime_type}' not found in data")
            return []
        
        # Create a subset with just the crime type
        crime_data = historical_data[['date', crime_type]].copy()
        crime_data.rename(columns={crime_type: 'incidents'}, inplace=True)
        
        print(f"\nForecasting {crime_type} for: {region}")
        
        # Train and forecast
        forecast, model = self.train_and_forecast(crime_data, periods=periods)
        
        # Format for frontend
        formatted_forecast = self.format_forecast_for_frontend(
            forecast, crime_data, periods
        )
        
        return formatted_forecast
    
    def get_forecast_summary(self, forecast_data):
        """
        Generate summary statistics from forecast
        
        Args:
            forecast_data: Formatted forecast data
            
        Returns:
            Dict with summary statistics
        """
        if not forecast_data:
            return {}
        
        future_predictions = [f['predicted'] for f in forecast_data if f['actual'] is None]
        
        if not future_predictions:
            return {}
        
        return {
            'next_month': future_predictions[0] if future_predictions else 0,
            'avg_forecast': int(np.mean(future_predictions)),
            'max_forecast': int(np.max(future_predictions)),
            'min_forecast': int(np.min(future_predictions)),
            'trend': 'increasing' if len(future_predictions) > 1 and 
                     future_predictions[-1] > future_predictions[0] else 'stable'
        }
    
    def clear_cache(self):
        """Clear cached forecasts and models"""
        self.models = {}
        self.forecasts = {}
        print("✓ Forecast cache cleared")




forecaster = CybercrimeForecaster()

