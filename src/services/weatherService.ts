export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  rainProb: number;
  condition: string;
  summary: string;
  location: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  rainProb: number;
  wind: number;
  condition: string;
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  rainProb: number;
  wind: number;
  humidity: number;
  condition: string;
}

export const getMockCurrentWeather = (location?: string): WeatherData => ({
  temp: 29,
  feelsLike: 32,
  humidity: 78,
  windSpeed: 12,
  pressure: 1012,
  visibility: 8,
  uvIndex: 6,
  rainProb: 35,
  condition: "Partly Cloudy",
  summary: "Warm conditions are expected today with a possibility of afternoon rainfall.",
  location: location || "Darbhanga, Bihar"
});

export const getMockHourlyForecast = (): HourlyForecast[] => {
  return [
    { time: "08:00", temp: 29, rainProb: 10, wind: 10, condition: "Sunny" },
    { time: "12:00", temp: 32, rainProb: 35, wind: 14, condition: "Partly Cloudy" },
    { time: "16:00", temp: 30, rainProb: 78, wind: 18, condition: "Rain" },
    { time: "20:00", temp: 27, rainProb: 25, wind: 12, condition: "Cloudy" },
    { time: "00:00", temp: 26, rainProb: 10, wind: 8, condition: "Clear" },
    { time: "04:00", temp: 25, rainProb: 5, wind: 6, condition: "Clear" },
  ];
};

export const getMockDailyForecast = (): DailyForecast[] => {
  return [
    { date: "Today", minTemp: 26, maxTemp: 32, rainProb: 60, wind: 15, humidity: 75, condition: "Rain" },
    { date: "Tomorrow", minTemp: 25, maxTemp: 31, rainProb: 80, wind: 20, humidity: 82, condition: "Storm" },
    { date: "Wed", minTemp: 27, maxTemp: 34, rainProb: 20, wind: 10, humidity: 65, condition: "Sunny" },
    { date: "Thu", minTemp: 28, maxTemp: 35, rainProb: 10, wind: 8, humidity: 60, condition: "Sunny" },
    { date: "Fri", minTemp: 27, maxTemp: 33, rainProb: 40, wind: 12, humidity: 70, condition: "Cloudy" },
    { date: "Sat", minTemp: 26, maxTemp: 32, rainProb: 50, wind: 14, humidity: 75, condition: "Rain" },
    { date: "Sun", minTemp: 25, maxTemp: 30, rainProb: 90, wind: 25, humidity: 85, condition: "Storm" },
  ];
};
