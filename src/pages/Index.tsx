import { useState, useMemo } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import RiskBanner from "@/components/RiskBanner";
import StatsCards from "@/components/StatsCards";
import IncidentTrendChart from "@/components/IncidentTrendChart";
import CrimeTypeChart from "@/components/CrimeTypeChart";
import RegionalHeatmap from "@/components/RegionalHeatmap";
import ForecastChart from "@/components/ForecastChart";
import FilterControls from "@/components/FilterControls";
import DashboardFooter from "@/components/DashboardFooter";
import {
  regions,
  crimeTypes,
  forecastData,
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

  // Apply filters to all data
  const filteredData = useMemo(() => {
    return {
      trendData: filterDataByRegionAndType(selectedRegion, selectedCrimeType),
      crimeTypeData: getCrimeTypeDistribution(selectedRegion, selectedCrimeType),
      regionalData: getRegionalDistribution(selectedRegion, selectedCrimeType),
      stats: getFilteredStats(selectedRegion, selectedCrimeType),
    };
  }, [selectedRegion, selectedCrimeType]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8 space-y-8">
      {/* Risk Banner */}
        <RiskBanner riskLevel={filteredData.stats.riskLevel} />

        {/* Key Statistics */}
        <StatsCards
          totalIncidents={filteredData.stats.totalIncidents}
          mostCommonType={filteredData.stats.mostCommonType}
          topRegion={filteredData.stats.topRegion}
          riskLevel={filteredData.stats.riskLevel}
        />

        {/* Filter Controls */}
        <FilterControls
          regions={regions}
          crimeTypes={crimeTypes}
          selectedRegion={selectedRegion}
          selectedCrimeType={selectedCrimeType}
          onRegionChange={setSelectedRegion}
          onCrimeTypeChange={setSelectedCrimeType}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncidentTrendChart data={filteredData.trendData} />
          <CrimeTypeChart data={filteredData.crimeTypeData} />
        </div>

        {/* Regional and Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RegionalHeatmap data={filteredData.regionalData} />
          <ForecastChart data={forecastData} />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Index;
