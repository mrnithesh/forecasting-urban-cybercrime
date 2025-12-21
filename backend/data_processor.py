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
        

    # SYNTHETIC DATA GENERATION
   
    def generate_synthetic_yearly_data(self):
        """
        Extend yearly data to include 2016-2017 (backcasting) and 2023-2025 (forecasting).
        SYNTHETIC COMPONENT: Yearly totals extension
        """
        extended_data = []
        
        # Filter only state rows (exclude totals)
        state_rows = self.state_yearly_df[self.state_yearly_df['Categroy'] == 'State']
        
        for _, row in state_rows.iterrows():
            state_name = row['State/UT']
            
            # Base years data
            base_data = {
                '2018': row['2018'],
                '2019': row['2019'],
                '2020': row['2020'],
                '2021': row['2021'],
                '2022': row['2022']
            }
            
            # Backcast 2016-2017 (~10% reduction per year backwards)
            base_2018 = base_data['2018']
            base_data['2017'] = int(base_2018 * 0.90)
            base_data['2016'] = int(base_data['2017'] * 0.90)
            
            # Forecast 2023-2025 (~10% growth per year forwards)
            base_2022 = base_data['2022']
            base_data['2023'] = int(base_2022 * 1.10)
            base_data['2024'] = int(base_data['2023'] * 1.10)
            base_data['2025'] = int(base_data['2024'] * 1.10)
            
            record = {'state': state_name}
            record.update(base_data)
            extended_data.append(record)
        
        return pd.DataFrame(extended_data)
    
    # YEARLY → MONTHLY DISAGGREGATION
    
    def generate_monthly_data(self, state_yearly_df):
        """ Convert yearly totals to monthly data with realistic seasonality
        Convert yearly totals to monthly data with realistic seasonality.
        SYNTHETIC COMPONENT: Monthly distribution from yearly totals
        VALIDATION: Monthly sum equals yearly total
        """
        monthly_records = []
        
        for _, row in state_yearly_df.iterrows():
            state = row['state']
            
            # Process each year from 2016 to 2025
            for year in range(2016, 2026):
                yearly_total = int(row[str(year)])
                
                # Generate 12 monthly values using seasonality + controlled randomness
                monthly_values = self._distribute_yearly_to_monthly(yearly_total)
                
                # Determine how many months to generate
                # Full year for 2016-2024, only up to June (6 months) for 2025
                months_to_generate = 6 if year == 2025 else 12
                
                # Create records for each month
                for month in range(1, months_to_generate + 1):
                    date_str = f"{year}-{month:02d}-01"
                    monthly_records.append({
                        'state': state,  # Changed from city to state
                        'date': date_str,
                        'year': year,
                        'month': month,
                        'incidents': monthly_values[month - 1]
                    })
        
        return pd.DataFrame(monthly_records)
    
    def _distribute_yearly_to_monthly(self, yearly_total):
        
        # Distribute yearly total across 12 months with seasonality and variation.
        # Ensures monthly sum equals yearly total.

        # Ensure yearly_total is int
        yearly_total = int(yearly_total)

        # Apply seasonality factors
        base_monthly = [yearly_total * (factor / 12) for factor in MONTHLY_SEASONALITY]
        
        # Add controlled random variation (±10%)
        np.random.seed(yearly_total)  # Reproducible randomness
        variation = np.random.uniform(0.9, 1.1, 12)
        monthly = [int(base * var) for base, var in zip(base_monthly, variation)]
        
        # Adjust to match exact yearly total (important for validation)
        current_sum = sum(monthly)
        diff = yearly_total - current_sum
        
        # Distribute difference across months
        if diff != 0:
            # Handle positive and negative differences correctly
            sign = 1 if diff > 0 else -1
            abs_diff = abs(diff)
            
            adjustment_per_month = abs_diff // 12
            remainder = abs_diff % 12
            
            # Apply base adjustment to all months
            monthly = [m + (adjustment_per_month * sign) for m in monthly]
            
            # Distribute remainder
            for i in range(remainder):
                monthly[i] += sign
        
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
        
        # Step 2: Generate synthetic yearly data (State-level)
        print("\nGenerating synthetic yearly data (2016-2025)...")
        state_yearly = self.generate_synthetic_yearly_data()
        print(f"✓ Generated data for {len(state_yearly)} state-year combinations")
        
        # Step 3: Generate monthly data (SYNTHETIC with REAL yearly totals)
        print("\nGenerating monthly data from yearly totals...")
        monthly_data = self.generate_monthly_data(state_yearly)
        print(f"✓ Generated {len(monthly_data)} monthly records")
        
        # Step 4: Add crime type breakdown (based on REAL proportions)
        print("\nAdding crime type distributions...")
        enhanced_data = self.add_crime_type_breakdown(monthly_data)
        print(f"✓ Added {len(FRONTEND_CRIME_TYPES)} crime type categories")
        
        # Validation
        self._validate_data(state_yearly, enhanced_data)
        
        self.processed_data = enhanced_data
        return enhanced_data
    
    def _validate_data(self, state_yearly, monthly_data):
        """Validate that monthly totals match yearly totals"""
        print("\nValidating data integrity...")
        
        for state in state_yearly['state'].unique():
            state_yearly_subset = state_yearly[state_yearly['state'] == state]
            state_monthly_subset = monthly_data[monthly_data['state'] == state]
            
            # Validate 2016-2024 (Full years)
            for year in range(2016, 2025):
                yearly_total = state_yearly_subset[str(year)].sum()
                monthly_total = state_monthly_subset[
                    state_monthly_subset['year'] == year
                ]['incidents'].sum()
                
                if abs(yearly_total - monthly_total) > 1:  # Allow 1 incident rounding error
                    print(f"⚠ Mismatch for {state} {year}: {yearly_total} vs {monthly_total}")

            # Validate 2025 (Partial year - only compare if we want exact match, 
            # but here yearly_total is for full year, monthly is for 6 months)
            # We skip exact validation for 2025 total matching since we only generated 6 months
            # But we could check if monthly_total ≈ 0.5 * yearly_total (roughly)
        
        print("✓ Data validation complete")

    # DATA RETRIEVAL METHODS

    
    def get_incidents_by_region(self, region="All Regions", year="all"):
        """Get incident data filtered by region and year"""
        if self.processed_data is None:
            self.process_all_data()
        
        # Start with all data
        df = self.processed_data.copy()
        
        # Filter by Region
        if region != "All Regions":
            df = df[df['state'] == region]
            
        # Filter by Year
        if year != "all":
            try:
                year_int = int(year)
                df = df[df['year'] == year_int]
            except ValueError:
                # Handle non-integer year or other formats if necessary
                pass
        
        if region == "All Regions" and year == "all":
             # Aggregate all states for all years
            return df.groupby(['date', 'year', 'month']).agg({
                'incidents': 'sum',
                **{crime: 'sum' for crime in FRONTEND_CRIME_TYPES}
            }).reset_index()
            
        elif region == "All Regions":
             # Aggregate all states for specific year
             return df.groupby(['date', 'year', 'month']).agg({
                'incidents': 'sum',
                **{crime: 'sum' for crime in FRONTEND_CRIME_TYPES}
            }).reset_index()

        # Specific region (already filtered), specific year (already filtered)
        return df
    
    def get_available_regions(self):
        """Get list of available states"""
        if self.processed_data is None:
            self.process_all_data()
        
        states = sorted(self.processed_data['state'].unique().tolist())
        return ["All Regions"] + states
    
    def get_crime_types(self):
        """Get list of crime types"""
        return ["All Types"] + FRONTEND_CRIME_TYPES



# Create singleton instance for use across the application
data_processor = DataProcessor()

