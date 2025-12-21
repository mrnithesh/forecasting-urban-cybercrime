/**
 * API Client for Urban Cybercrime Forecasting Backend
 * 
 * Connects React frontend to Flask API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Generic API fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface IncidentData {
  date: string;
  incidents: number;
  [key: string]: any; // Crime type fields
}

export interface CrimeTypeData {
  type: string;
  count: number;
}

export interface RegionalData {
  region: string;
  incidents: number;
  risk: 'Low' | 'Moderate' | 'High';
}

export interface ForecastData {
  date: string;
  actual: number | null;
  predicted: number;
  lower?: number;
  upper?: number;
}

export interface StatsData {
  totalIncidents: number;
  mostCommonType: string;
  topRegion: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  avgMonthly: number;
  forecast?: {
    next_month: number;
    avg_forecast: number;
    max_forecast: number;
    min_forecast: number;
    trend: string;
  };
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  return apiFetch('/api/health');
}

/**
 * Get available regions/cities
 */
export async function getRegions(): Promise<string[]> {
  return apiFetch('/api/regions');
}

/**
 * Get available crime types
 */
export async function getCrimeTypes(): Promise<string[]> {
  return apiFetch('/api/crime-types');
}

/**
 * Get incident trend data (time series)
 */
export async function getIncidentTrend(
  region: string = 'All Regions',
  crimeType: string = 'All Types',
  year: string = 'all'
): Promise<IncidentData[]> {
  const params = new URLSearchParams({
    region,
    crime_type: crimeType,
    format: 'trend',
  });
  
  if (year !== 'all') {
    params.append('year', year);
  }
  
  return apiFetch(`/api/incidents?${params}`);
}

/**
 * Get crime type distribution
 */
export async function getCrimeTypeDistribution(
  region: string = 'All Regions',
  crimeType: string = 'All Types',
  year: string = 'all'
): Promise<CrimeTypeData[]> {
  const params = new URLSearchParams({
    region,
    crime_type: crimeType,
    format: 'crime-type',
  });
  
  if (year !== 'all') {
    params.append('year', year);
  }
  
  return apiFetch(`/api/incidents?${params}`);
}

/**
 * Get regional distribution
 */
export async function getRegionalDistribution(
  region: string = 'All Regions',
  crimeType: string = 'All Types',
  year: string = 'all'
): Promise<RegionalData[]> {
  const params = new URLSearchParams({
    region,
    crime_type: crimeType,
    format: 'regional',
  });
  
  if (year !== 'all') {
    params.append('year', year);
  }
  
  return apiFetch(`/api/incidents?${params}`);
}

/**
 * Get forecast data
 */
export async function getForecast(
  region: string = 'All Regions',
  periods: number = 6,
  crimeType?: string
): Promise<ForecastData[]> {
  const params = new URLSearchParams({
    region,
    periods: periods.toString(),
  });
  
  if (crimeType && crimeType !== 'All Types') {
    params.append('crime_type', crimeType);
  }
  
  return apiFetch(`/api/forecast?${params}`);
}

/**
 * Get summary statistics
 */
export async function getStats(
  region: string = 'All Regions',
  crimeType: string = 'All Types',
  year: string = 'all'
): Promise<StatsData> {
  const params = new URLSearchParams({
    region,
    crime_type: crimeType,
  });
  
  if (year !== 'all') {
    params.append('year', year);
  }
  
  return apiFetch(`/api/stats?${params}`);
}

/**
 * Clear forecast cache (development only)
 */
export async function clearCache(): Promise<{ message: string }> {
  return apiFetch('/api/clear-cache', { method: 'POST' });
}

// ============================================================================
// AGGREGATE DATA FETCHER
// ============================================================================

/**
 * Fetch all dashboard data at once
 * Useful for initial page load
 */
export async function getAllDashboardData(
  region: string = 'All Regions',
  crimeType: string = 'All Types',
  year: string = 'all'
) {
  try {
    const [
      trendData,
      crimeTypeData,
      regionalData,
      forecastData,
      stats,
      regions,
      crimeTypes,
    ] = await Promise.all([
      getIncidentTrend(region, crimeType, year),
      getCrimeTypeDistribution(region, crimeType, year),
      getRegionalDistribution(region, crimeType, year),
      getForecast(region, 6, crimeType),
      getStats(region, crimeType, year),
      getRegions(),
      getCrimeTypes(),
    ]);

    return {
      trendData,
      crimeTypeData,
      regionalData,
      forecastData,
      stats,
      regions,
      crimeTypes,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

// ============================================================================
// EXPORT DEFAULT CLIENT
// ============================================================================

const apiClient = {
  healthCheck,
  getRegions,
  getCrimeTypes,
  getIncidentTrend,
  getCrimeTypeDistribution,
  getRegionalDistribution,
  getForecast,
  getStats,
  clearCache,
  getAllDashboardData,
};

export default apiClient;

