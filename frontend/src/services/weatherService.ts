// Real-time Weather Service using Open-Meteo (GFS Models)

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
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

const getWeatherCondition = (code: number): string => {
  if (code === 0) return "Clear Sky";
  if (code === 1 || code === 2 || code === 3) return "Partly Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 71 && code <= 75) return "Snow";
  if (code >= 80 && code <= 82) return "Heavy Rain";
  if (code >= 95) return "Thunderstorm";
  return "Clear";
};

export const fetchRealWeather = async (lat = 26.1542, lon = 85.8918, locationName = "Darbhanga, Bihar"): Promise<{current: WeatherData, hourly: HourlyForecast[]}> => {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`);
    const data = await res.json();

    const current: WeatherData = {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      rainProb: data.hourly.precipitation_probability[0],
      condition: getWeatherCondition(data.current.weather_code),
      summary: `Current conditions feature ${getWeatherCondition(data.current.weather_code).toLowerCase()} with a temperature of ${Math.round(data.current.temperature_2m)}°C. Data powered by GFS NWP Models.`,
      location: locationName
    };

    const hourly: HourlyForecast[] = [];
    for (let i = 0; i < 24; i += 3) {
      const date = new Date(data.hourly.time[i]);
      hourly.push({
        time: `${date.getHours().toString().padStart(2, '0')}:00`,
        temp: Math.round(data.hourly.temperature_2m[i]),
        rainProb: data.hourly.precipitation_probability[i],
        wind: Math.round(data.hourly.wind_speed_10m[i]),
        condition: getWeatherCondition(data.hourly.weather_code[i])
      });
    }

    return { current, hourly };
  } catch (error) {
    console.error("Error fetching weather:", error);
    // Fallback to mock if offline
    return {
      current: {
        temp: 29, feelsLike: 32, humidity: 78, windSpeed: 12, rainProb: 35,
        condition: "Partly Cloudy", summary: "Offline Mock Data", location: locationName
      },
      hourly: []
    };
  }
};
