import { regionalMonthlyData } from "@/data/sampleData";

export const filterDataByRegionAndType = (
  region: string,
  crimeType: string
) => {
  // Get base data - either for specific region or aggregate all
  let monthlyData;
  
  if (region === "All Regions") {
    // Aggregate all regions
    const allRegions = Object.keys(regionalMonthlyData);
    monthlyData = regionalMonthlyData[allRegions[0] as keyof typeof regionalMonthlyData].map((month, idx) => {
      const aggregated: any = { date: month.date, incidents: 0 };
      
      allRegions.forEach(reg => {
        const regionData = regionalMonthlyData[reg as keyof typeof regionalMonthlyData][idx];
        aggregated.incidents += regionData.incidents;
        
        // Aggregate each crime type
        Object.keys(regionData).forEach(key => {
          if (key !== 'date' && key !== 'incidents') {
            aggregated[key] = (aggregated[key] || 0) + (regionData[key as keyof typeof regionData] as number);
          }
        });
      });
      
      return aggregated;
    });
  } else {
    monthlyData = regionalMonthlyData[region as keyof typeof regionalMonthlyData];
  }

  // Filter by crime type if not "All Types"
  if (crimeType !== "All Types") {
    return monthlyData.map(month => ({
      date: month.date,
      incidents: month[crimeType as keyof typeof month] as number
    }));
  }

  return monthlyData.map(month => ({
    date: month.date,
    incidents: month.incidents
  }));
};

export const getCrimeTypeDistribution = (region: string, crimeType: string) => {
  const crimeTypes = ["Phishing", "Malware", "UPI Fraud", "Ransomware", "Data Breach", "Identity Theft", "Social Media Scam"];
  
  let data;
  if (region === "All Regions") {
    // Aggregate across all regions
    const allRegions = Object.keys(regionalMonthlyData);
    data = crimeTypes.map(type => {
      let total = 0;
      allRegions.forEach(reg => {
        regionalMonthlyData[reg as keyof typeof regionalMonthlyData].forEach(month => {
          total += month[type as keyof typeof month] as number || 0;
        });
      });
      return { type, count: total };
    });
  } else {
    // Single region
    data = crimeTypes.map(type => {
      const total = regionalMonthlyData[region as keyof typeof regionalMonthlyData].reduce((sum, month) => {
        return sum + (month[type as keyof typeof month] as number || 0);
      }, 0);
      return { type, count: total };
    });
  }

  // Filter by crime type if specified
  if (crimeType !== "All Types") {
    return data.filter(item => item.type === crimeType);
  }

  return data;
};

export const getRegionalDistribution = (region: string, crimeType: string) => {
  const allRegions = ["Mumbai", "Delhi NCR", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];
  
  if (region !== "All Regions") {
    // Single region - calculate its stats
    const regionData = regionalMonthlyData[region as keyof typeof regionalMonthlyData];
    
    let incidents;
    if (crimeType !== "All Types") {
      incidents = regionData.reduce((sum, month) => sum + (month[crimeType as keyof typeof month] as number || 0), 0);
    } else {
      incidents = regionData.reduce((sum, month) => sum + month.incidents, 0);
    }
    
    const risk = incidents > 3500 ? "High" : incidents > 2000 ? "Moderate" : "Low";
    
    return [{ region, incidents, risk }];
  }

  // All regions - calculate for each
  return allRegions.map(reg => {
    const regionData = regionalMonthlyData[reg as keyof typeof regionalMonthlyData];
    
    let incidents;
    if (crimeType !== "All Types") {
      incidents = regionData.reduce((sum, month) => sum + (month[crimeType as keyof typeof month] as number || 0), 0);
    } else {
      incidents = regionData.reduce((sum, month) => sum + month.incidents, 0);
    }
    
    const risk = incidents > 3500 ? "High" : incidents > 2000 ? "Moderate" : "Low";
    
    return { region: reg, incidents, risk };
  });
};

export const getFilteredStats = (region: string, crimeType: string) => {
  const trendData = filterDataByRegionAndType(region, crimeType);
  const crimeDistribution = getCrimeTypeDistribution(region, crimeType);
  const regionalDistribution = getRegionalDistribution(region, crimeType);
  
  const totalIncidents = trendData.reduce((sum, item) => sum + item.incidents, 0);
  
  // Find most common type
  let mostCommonType = "Phishing";
  if (crimeType === "All Types") {
    const maxCrime = crimeDistribution.reduce((max, item) => 
      item.count > max.count ? item : max
    );
    mostCommonType = maxCrime.type;
  } else {
    mostCommonType = crimeType;
  }
  
  // Find top region
  let topRegion = "Mumbai";
  if (region === "All Regions") {
    const maxRegion = regionalDistribution.reduce((max, item) => 
      item.incidents > max.incidents ? item : max
    );
    topRegion = maxRegion.region;
  } else {
    topRegion = region;
  }
  
  // Calculate risk level
  const avgMonthly = totalIncidents / trendData.length;
  const riskLevel: "Low" | "Moderate" | "High" = 
    avgMonthly > 1500 ? "High" : avgMonthly > 1000 ? "Moderate" : "Low";
  
  return {
    totalIncidents,
    mostCommonType,
    topRegion,
    riskLevel,
  };
};
