import { useState } from "react";
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
  incidentTrendData,
  crimeTypeData,
  regionalData,
  forecastData,
  keyStats,
} from "@/data/sampleData";

const Index = () => {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCrimeType, setSelectedCrimeType] = useState("All Types");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Risk Banner */}
        <RiskBanner riskLevel={keyStats.riskLevel} />

        {/* Key Statistics */}
        <StatsCards
          totalIncidents={keyStats.totalIncidents}
          mostCommonType={keyStats.mostCommonType}
          topRegion={keyStats.topRegion}
          riskLevel={keyStats.riskLevel}
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
          <IncidentTrendChart data={incidentTrendData} />
          <CrimeTypeChart data={crimeTypeData} />
        </div>

        {/* Regional and Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RegionalHeatmap data={regionalData} />
          <ForecastChart data={forecastData} />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Index;
