// Real-time Weather Service using Open-Meteo.
//
// Used by Dashboard.tsx.
// If you need to add a new weather label, edit getWeatherCondition below.

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

// Converts Open-Meteo weather codes and simple thresholds into readable labels.
const getWeatherCondition = (code: number, temp?: number, windSpeed?: number, rainProb?: number): string => {
  if (typeof temp === 'number' && temp >= 42) return "Severe Heat Wave";
  if (typeof temp === 'number' && temp >= 37) return "Heat Wave";
  if (typeof windSpeed === 'number' && windSpeed >= 50) return "Damaging Winds";
  if (typeof rainProb === 'number' && rainProb >= 80) return "Very High Rain Probability";
  if (code === 0) return "Clear Sky";
  if (code === 1 || code === 2 || code === 3) return "Partly Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 66 && code <= 67) return "Freezing Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Heavy Rain Showers";
  if (code >= 85 && code <= 86) return "Snow Showers";
  if (code >= 95) return "Thunderstorm";
  return "Stable Weather";
};

// Fetches current weather and a small hourly forecast for the dashboard.
export const fetchRealWeather = async (lat = 26.1542, lon = 85.8918, locationName = "Darbhanga, Bihar"): Promise<{current: WeatherData, hourly: HourlyForecast[]}> => {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`);
    const data = await res.json();

    const temp = Math.round(data.current.temperature_2m);
    const feelsLike = Math.round(data.current.apparent_temperature);
    const windSpeed = Math.round(data.current.wind_speed_10m);
    const rainProb = data.hourly.precipitation_probability[0];
    const condition = getWeatherCondition(data.current.weather_code, temp, windSpeed, rainProb);

    const current: WeatherData = {
      temp,
      feelsLike,
      humidity: data.current.relative_humidity_2m,
      windSpeed,
      rainProb,
      condition,
      summary: `Current conditions feature ${condition.toLowerCase()} with a temperature of ${temp}°C. Data powered by GFS NWP Models.`,
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
