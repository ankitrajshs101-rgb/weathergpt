export type AlertSeverity = 'Normal' | 'Advisory' | 'Watch' | 'Warning' | 'Severe';

export interface WeatherAlert {
  id: string;
  location: string;
  hazard: string;
  severity: AlertSeverity;
  startTime: string;
  endTime: string;
  description: string;
  risk: string;
  recommendedAction: string;
  source: string;
  lastUpdated: string;
  riskScore: number; // 0-100
}

export const getMockAlerts = (location?: string): WeatherAlert[] => {
  return [
    {
      id: "ALT-101",
      location: location || "Darbhanga, Bihar",
      hazard: "Heavy Rain",
      severity: "Warning",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      description: "Heavy to very heavy rainfall expected in isolated places.",
      risk: "High risk of localized flooding and waterlogging in low-lying areas.",
      recommendedAction: "Avoid unnecessary travel. Stay away from waterlogged areas and open drains.",
      source: "Mock Official Source",
      lastUpdated: new Date().toISOString(),
      riskScore: 75
    },
    {
      id: "ALT-102",
      location: "Patna, Bihar",
      hazard: "Thunderstorm",
      severity: "Watch",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 43200000).toISOString(),
      description: "Thunderstorm with lightning likely.",
      risk: "Moderate risk of lightning strikes.",
      recommendedAction: "Stay indoors during the thunderstorm. Unplug electronic devices.",
      source: "AI Analysis",
      lastUpdated: new Date().toISOString(),
      riskScore: 45
    }
  ];
};
