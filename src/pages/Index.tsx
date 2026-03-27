import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import RiskBanner from "@/components/RiskBanner";
import StatsCards from "@/components/StatsCards";
import IncidentTrendChart from "@/components/IncidentTrendChart";
import CrimeTypeChart from "@/components/CrimeTypeChart";
import RegionalHeatmap from "@/components/RegionalHeatmap";
import ForecastChart from "@/components/ForecastChart";
import FilterControls from "@/components/FilterControls";
import DashboardFooter from "@/components/DashboardFooter";
import apiClient from "@/api/client";
import {
  regions as fallbackRegions,
  crimeTypes as fallbackCrimeTypes,
  forecastData as fallbackForecastData,
} from "@/data/sampleData";
import {
  filterDataByRegionAndType,
  getCrimeTypeDistribution,
  getRegionalDistribution,
  getFilteredStats,
} from "@/utils/filterUtils";

const Index = () => {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCrimeType, setSelectedCrimeType] = useState("All Types");
  const [selectedYear, setSelectedYear] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useApi, setUseApi] = useState(true);
  
  // Data states
  const [regions, setRegions] = useState<string[]>(fallbackRegions);
  const [crimeTypes, setCrimeTypes] = useState<string[]>(fallbackCrimeTypes);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [crimeTypeData, setCrimeTypeData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>(fallbackForecastData);
  const [stats, setStats] = useState<any>({
    totalIncidents: 0,
    mostCommonType: "Phishing",
    topRegion: "Mumbai",
    riskLevel: "Moderate" as "Low" | "Moderate" | "High",
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!useApi) {
        // Use fallback data
        setTrendData(filterDataByRegionAndType(selectedRegion, selectedCrimeType));
        setCrimeTypeData(getCrimeTypeDistribution(selectedRegion, selectedCrimeType));
        setRegionalData(getRegionalDistribution(selectedRegion, selectedCrimeType));
        setStats(getFilteredStats(selectedRegion, selectedCrimeType));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.getAllDashboardData(selectedRegion, selectedCrimeType, selectedYear);
        
        setTrendData(data.trendData);
        setCrimeTypeData(data.crimeTypeData);
        setRegionalData(data.regionalData);
        setForecastData(data.forecastData);
        setStats(data.stats);
        setRegions(data.regions);
        setCrimeTypes(data.crimeTypes);
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data from API:", err);
        setError("Failed to connect to backend. Using sample data.");
        
        // Fallback to sample data
        setUseApi(false);
        setTrendData(filterDataByRegionAndType(selectedRegion, selectedCrimeType));
        setCrimeTypeData(getCrimeTypeDistribution(selectedRegion, selectedCrimeType));
        setRegionalData(getRegionalDistribution(selectedRegion, selectedCrimeType));
        setStats(getFilteredStats(selectedRegion, selectedCrimeType));
        
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRegion, selectedCrimeType, selectedYear, useApi]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8 space-y-8 dashboard-main-bg rounded-2xl">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Risk Banner */}
            <div className="motion-section" style={{ animationDelay: "40ms" }}>
              <RiskBanner riskLevel={stats.riskLevel} />
            </div>

            {/* Key Statistics */}
            <div className="motion-section" style={{ animationDelay: "120ms" }}>
              <StatsCards
                totalIncidents={stats.totalIncidents}
                mostCommonType={stats.mostCommonType}
                topRegion={stats.topRegion}
                riskLevel={stats.riskLevel}
              />
            </div>

            {/* Filter Controls */}
            <div className="motion-section" style={{ animationDelay: "180ms" }}>
              <FilterControls
                regions={regions}
                crimeTypes={crimeTypes}
                selectedRegion={selectedRegion}
                selectedCrimeType={selectedCrimeType}
                selectedYear={selectedYear}
                onRegionChange={setSelectedRegion}
                onCrimeTypeChange={setSelectedCrimeType}
                onYearChange={setSelectedYear}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="motion-section" style={{ animationDelay: "240ms" }}>
                <IncidentTrendChart data={trendData} />
              </div>
              <div className="motion-section" style={{ animationDelay: "300ms" }}>
                <CrimeTypeChart data={crimeTypeData} />
              </div>
            </div>

            {/* Regional and Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="motion-section" style={{ animationDelay: "360ms" }}>
                <RegionalHeatmap data={regionalData} />
              </div>
              <div className="motion-section" style={{ animationDelay: "420ms" }}>
                <ForecastChart data={forecastData} />
              </div>
            </div>

            {/* Data Source Attribution */}
            {useApi && (
              <div className="motion-section text-center text-sm text-muted-foreground" style={{ animationDelay: "480ms" }}>
                Data powered by Prophet forecasting model • Based on NCRB cybercrime statistics
              </div>
            )}
          </>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Index;
