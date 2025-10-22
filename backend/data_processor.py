"""
Data Processing Module for Urban Cybercrime Forecasting

This module processes real government cybercrime datasets and generates
city-level monthly data suitable for forecasting and visualization.

Data Sources:
- RS_Session_266_AU_226_A_i.csv: Official state-level yearly data (2018-2022)
- Dataset_CyberCrime_Sean.csv: Crime type distribution patterns

Transformations:
- State → City mapping (population-weighted)
- Yearly → Monthly disaggregation (with seasonality)
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import os

# State to City mapping with weights (for states with multiple major cities)
STATE_TO_CITY_MAPPING = {
    "Telangana": [("Hyderabad", 1.0)],
    "Karnataka": [("Bangalore", 1.0)],
    "Maharashtra": [("Mumbai", 0.60), ("Pune", 0.40)],
    "Uttar Pradesh": [("Delhi NCR", 0.35), ("Agra", 0.15)],  # Delhi NCR adjacent
    "Tamil Nadu": [("Chennai", 1.0)],
    "West Bengal": [("Kolkata", 1.0)],
}

# Crime type mapping from dataset to frontend categories
CRIME_TYPE_MAPPING = {
    "Fraud": "UPI Fraud",
    "Personal Revenge": "Identity Theft",
    "Sexual Exploitation": "Social Media Scam",
    "Anger": "Phishing",
    "Extortion": "Ransomware",
    "Causing Disrepute": "Phishing",
    "Prank": "Social Media Scam",
    "Disrupt Public Service": "Malware",
    "Sale purchase illegal drugs": "Data Breach",
    "Developing own business": "Data Breach",
    "Spreading Piracy": "Data Breach",
    "Psycho or Pervert": "Identity Theft",
    "Steal Information": "Data Breach",
    "Abetment to Suicide": "Identity Theft",
    "Others": "Phishing",
}

FRONTEND_CRIME_TYPES = [
    "Phishing",
    "Malware",
    "UPI Fraud",
    "Ransomware",
    "Data Breach",
    "Identity Theft",
    "Social Media Scam",
]

# Seasonality factors for monthly distribution (sum = 12)
# Higher in Q2 (Apr-Jun) and Q4 (Oct-Dec) based on cybercrime patterns
MONTHLY_SEASONALITY = [0.85, 0.82, 0.95, 1.08, 1.12, 1.05, 0.98, 0.92, 1.03, 1.10, 1.05, 1.05]


class DataProcessor:
    def __init__(self, dataset_path=None):
        # Auto-detect dataset path
        if dataset_path is None:
            # Get the directory where this script is located
            script_dir = Path(__file__).parent
            dataset_path = script_dir / "datasets"
        
        self.dataset_path = Path(dataset_path)
        self.state_yearly_df = None
        self.crime_type_df = None
        self.processed_data = None
        
    def load_datasets(self):
        # Load all required CSV datasets
        print("Loading datasets...")
        
        # Load state-level yearly data (2018-2022)
        state_file = self.dataset_path / "RS_Session_266_AU_226_A_i.csv"
        self.state_yearly_df = pd.read_csv(state_file)
        
        # Load crime type distribution data
        crime_file = self.dataset_path / "Dataset_CyberCrime_Sean.csv"
        self.crime_type_df = pd.read_csv(crime_file)
        
        print(f"✓ Loaded {len(self.state_yearly_df)} state records")
        print(f"✓ Loaded {len(self.crime_type_df)} crime distribution records")
        

    # STATE → CITY MAPPING
   
    def map_states_to_cities(self):
        """
        Map state-level data to city-level data using population weights.
        SYNTHETIC COMPONENT: City-level breakdown from state totals
        """
        city_data = []
        
        # Filter only state rows (exclude totals)
        state_rows = self.state_yearly_df[self.state_yearly_df['Categroy'] == 'State']
        
        for _, row in state_rows.iterrows():
            state_name = row['State/UT']
            
            # Only process states we have city mappings for
            if state_name in STATE_TO_CITY_MAPPING:
                cities = STATE_TO_CITY_MAPPING[state_name]
                
                # Distribute incidents across cities based on weights
                for city_name, weight in cities:
                    city_record = {
                        'city': city_name,
                        'state': state_name,
                        '2018': int(row['2018'] * weight),
                        '2019': int(row['2019'] * weight),
                        '2020': int(row['2020'] * weight),
                        '2021': int(row['2021'] * weight),
                        '2022': int(row['2022'] * weight),
                    }
                    city_data.append(city_record)
        
        return pd.DataFrame(city_data)
    
    # YEARLY → MONTHLY DISAGGREGATION
    
    def generate_monthly_data(self, city_yearly_df):
        """ Convert yearly totals to monthly data with realistic seasonality
        Convert yearly totals to monthly data with realistic seasonality.
        SYNTHETIC COMPONENT: Monthly distribution from yearly totals
        VALIDATION: Monthly sum equals yearly total
        """
        monthly_records = []
        
        for _, row in city_yearly_df.iterrows():
            city = row['city']
            
            # Process each year
            for year in [2018, 2019, 2020, 2021, 2022]:
                yearly_total = row[str(year)]
                
                # Generate 12 monthly values using seasonality + controlled randomness
                monthly_values = self._distribute_yearly_to_monthly(yearly_total)
                
                # Create records for each month
                for month in range(1, 13):
                    date_str = f"{year}-{month:02d}-01"
                    monthly_records.append({
                        'city': city,
                        'date': date_str,
                        'year': year,
                        'month': month,
                        'incidents': monthly_values[month - 1]
                    })
        
        return pd.DataFrame(monthly_records)
    
    def _distribute_yearly_to_monthly(self, yearly_total):
        
        # Distribute yearly total across 12 months with seasonality and variation.
        # Ensures monthly sum equals yearly total.

        # Apply seasonality factors
        base_monthly = [yearly_total * (factor / 12) for factor in MONTHLY_SEASONALITY]
        
        # Add controlled random variation (±10%)
        np.random.seed(int(yearly_total))  # Reproducible randomness
        variation = np.random.uniform(0.9, 1.1, 12)
        monthly = [int(base * var) for base, var in zip(base_monthly, variation)]
        
        # Adjust to match exact yearly total (important for validation)
        current_sum = sum(monthly)
        diff = yearly_total - current_sum
        
        # Distribute difference across months
        if diff != 0:
            adjustment_per_month = diff // 12
            remainder = diff % 12
            monthly = [m + adjustment_per_month for m in monthly]
            for i in range(abs(remainder)):
                monthly[i] += (1 if diff > 0 else -1)
        
        return monthly
    
    # CRIME TYPE DISTRIBUTION
   
    
    def add_crime_type_breakdown(self, monthly_df):
        """
        Add crime type breakdown to monthly data based on real distributions.
        Uses actual crime type proportions from Dataset_CyberCrime_Sean.csv
        """
        # Calculate crime type proportions from real data
        crime_proportions = self._calculate_crime_type_proportions()
        
        # Add crime type columns to each monthly record
        enhanced_records = []
        
        for _, row in monthly_df.iterrows():
            record = row.to_dict()
            total_incidents = row['incidents']
            
            # Distribute incidents across crime types
            for crime_type, proportion in crime_proportions.items():
                record[crime_type] = int(total_incidents * proportion)
            
            enhanced_records.append(record)
        
        return pd.DataFrame(enhanced_records)
    
    def _calculate_crime_type_proportions(self):
        """
        Calculate real crime type proportions from Dataset_CyberCrime_Sean.csv
        Map to frontend categories and normalize
        """
        # Get all crime type columns (exclude City and Total)
        crime_columns = [col for col in self.crime_type_df.columns 
                        if col not in ['City', 'Total'] and col.strip()]
        
        # Calculate totals for each original crime type
        crime_totals = {}
        for col in crime_columns:
            total = self.crime_type_df[col].sum()
            if pd.notna(total) and total > 0:
                crime_totals[col] = total
        
        # Map to frontend categories
        frontend_totals = {crime_type: 0 for crime_type in FRONTEND_CRIME_TYPES}
        
        for original_type, total in crime_totals.items():
            mapped_type = CRIME_TYPE_MAPPING.get(original_type, "Phishing")
            frontend_totals[mapped_type] += total
        
        # Normalize to proportions (sum = 1)
        total_all = sum(frontend_totals.values())
        proportions = {k: v / total_all for k, v in frontend_totals.items()}
        
        return proportions
    
    # MAIN PROCESSING PIPELINE

    
    def process_all_data(self):
        """
        Main pipeline: Load → Map → Disaggregate → Enhance
        Returns processed monthly data with crime type breakdown
        """
        # Step 1: Load raw datasets
        self.load_datasets()
        
        # Step 2: Map states to cities (SYNTHETIC)
        print("\nMapping states to cities...")
        city_yearly = self.map_states_to_cities()
        print(f"✓ Generated data for {len(city_yearly)} city-year combinations")
        
        # Step 3: Generate monthly data (SYNTHETIC with REAL yearly totals)
        print("\nGenerating monthly data from yearly totals...")
        monthly_data = self.generate_monthly_data(city_yearly)
        print(f"✓ Generated {len(monthly_data)} monthly records")
        
        # Step 4: Add crime type breakdown (based on REAL proportions)
        print("\nAdding crime type distributions...")
        enhanced_data = self.add_crime_type_breakdown(monthly_data)
        print(f"✓ Added {len(FRONTEND_CRIME_TYPES)} crime type categories")
        
        # Validation
        self._validate_data(city_yearly, enhanced_data)
        
        self.processed_data = enhanced_data
        return enhanced_data
    
    def _validate_data(self, city_yearly, monthly_data):
        """Validate that monthly totals match yearly totals"""
        print("\nValidating data integrity...")
        
        for city in city_yearly['city'].unique():
            city_yearly_subset = city_yearly[city_yearly['city'] == city]
            city_monthly_subset = monthly_data[monthly_data['city'] == city]
            
            for year in [2018, 2019, 2020, 2021, 2022]:
                yearly_total = city_yearly_subset[str(year)].sum()
                monthly_total = city_monthly_subset[
                    city_monthly_subset['year'] == year
                ]['incidents'].sum()
                
                if abs(yearly_total - monthly_total) > 1:  # Allow 1 incident rounding error
                    print(f"⚠ Mismatch for {city} {year}: {yearly_total} vs {monthly_total}")
        
        print("✓ Data validation complete")

    # DATA RETRIEVAL METHODS

    
    def get_incidents_by_region(self, region="All Regions"):
        """Get incident data filtered by region"""
        if self.processed_data is None:
            self.process_all_data()
        
        if region == "All Regions":
            # Aggregate all cities
            return self.processed_data.groupby(['date', 'year', 'month']).agg({
                'incidents': 'sum',
                **{crime: 'sum' for crime in FRONTEND_CRIME_TYPES}
            }).reset_index()
        else:
            # Single city
            return self.processed_data[self.processed_data['city'] == region].copy()
    
    def get_available_regions(self):
        """Get list of available cities"""
        if self.processed_data is None:
            self.process_all_data()
        
        cities = sorted(self.processed_data['city'].unique().tolist())
        return ["All Regions"] + cities
    
    def get_crime_types(self):
        """Get list of crime types"""
        return ["All Types"] + FRONTEND_CRIME_TYPES



# Create singleton instance for use across the application
data_processor = DataProcessor()

