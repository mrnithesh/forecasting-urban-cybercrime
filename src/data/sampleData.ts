export const regions = [
  "All Regions",
  "Downtown Core",
  "North District",
  "East Side",
  "West End",
  "South Quarter",
];

export const crimeTypes = [
  "All Types",
  "Phishing",
  "Malware",
  "Fraud",
  "Ransomware",
  "Data Breach",
  "Identity Theft",
];

export const incidentTrendData = [
  { date: "2024-01", incidents: 145 },
  { date: "2024-02", incidents: 168 },
  { date: "2024-03", incidents: 192 },
  { date: "2024-04", incidents: 178 },
  { date: "2024-05", incidents: 215 },
  { date: "2024-06", incidents: 234 },
  { date: "2024-07", incidents: 256 },
  { date: "2024-08", incidents: 243 },
  { date: "2024-09", incidents: 289 },
  { date: "2024-10", incidents: 312 },
  { date: "2024-11", incidents: 298 },
  { date: "2024-12", incidents: 325 },
];

export const crimeTypeData = [
  { type: "Phishing", count: 856 },
  { type: "Malware", count: 634 },
  { type: "Fraud", count: 521 },
  { type: "Ransomware", count: 342 },
  { type: "Data Breach", count: 298 },
  { type: "Identity Theft", count: 264 },
];

export const regionalData = [
  { region: "Downtown Core", incidents: 542, risk: "High" },
  { region: "North District", incidents: 387, risk: "Moderate" },
  { region: "East Side", incidents: 456, risk: "High" },
  { region: "West End", incidents: 298, risk: "Low" },
  { region: "South Quarter", incidents: 412, risk: "Moderate" },
];

export const forecastData = [
  { date: "2024-10", actual: 312, predicted: 308 },
  { date: "2024-11", actual: 298, predicted: 302 },
  { date: "2024-12", actual: 325, predicted: 318 },
  { date: "2025-01", actual: null, predicted: 338 },
  { date: "2025-02", actual: null, predicted: 352 },
  { date: "2025-03", actual: null, predicted: 365 },
  { date: "2025-04", actual: null, predicted: 348 },
  { date: "2025-05", actual: null, predicted: 371 },
  { date: "2025-06", actual: null, predicted: 389 },
];

export const keyStats = {
  totalIncidents: 2915,
  mostCommonType: "Phishing",
  topRegion: "Downtown Core",
  riskLevel: "High" as "Low" | "Moderate" | "High",
};
