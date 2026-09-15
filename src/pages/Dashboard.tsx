import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { fetchRealWeather, WeatherData, HourlyForecast } from '../services/weatherService';
import { Cloud, Droplets, Wind, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { getMockAlerts } from '../services/alertService';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(true);
  
  const alerts = getMockAlerts();
  const navigate = useNavigate();

  useEffect(() => {
    const loadWeather = async (lat?: number, lon?: number, cityName?: string) => {
      try {
        setLoading(true);
        const data = await fetchRealWeather(lat, lon, cityName);
        setWeather(data.current);
        setHourly(data.hourly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLocating(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            // Reverse geocoding to get city name
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const geoData = await res.json();
            const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county || "Your Location";
            loadWeather(lat, lon, city);
          } catch (e) {
            loadWeather(lat, lon, "Your Location");
          }
        },
        (error) => {
          console.warn("Geolocation denied or failed:", error);
          // Fallback to default
          loadWeather();
        }
      );
    } else {
      // Fallback if geolocation not supported
      loadWeather();
    }
  }, []);

  if (loading || !weather) {
    return (
      <div className="flex flex-col h-64 items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {locating && <p className="text-sm flex items-center"><MapPin className="h-4 w-4 mr-2"/> Auto-detecting your location...</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning, John</h1>
          <p className="text-muted-foreground">{weather.summary}</p>
        </div>
        {alerts.length > 0 && (
          <Button variant="destructive" onClick={() => navigate('/alerts')}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Weather Card */}
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white/80 font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Current Weather in {weather.location}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-6xl font-extrabold">{weather.temp}°C</div>
                <div className="text-xl font-medium mt-2">{weather.condition}</div>
                <div className="text-sm text-white/80 mt-1">Feels like {weather.feelsLike}°C</div>
              </div>
              <Cloud className="w-24 h-24 text-white/90" />
            </div>
          </CardContent>
        </Card>

        {/* Small metric cards */}
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rain Probability</p>
              <h4 className="text-2xl font-bold">{weather.rainProb ?? 0}%</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wind Speed</p>
              <h4 className="text-2xl font-bold">{weather.windSpeed} km/h</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Forecast (Powered by GFS)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto gap-4 pb-4">
            {hourly.map((h, i) => (
              <div key={i} className="min-w-[100px] flex flex-col items-center justify-center p-4 rounded-xl border bg-muted/20">
                <span className="text-sm font-medium text-muted-foreground">{h.time}</span>
                <Cloud className="h-8 w-8 my-3 text-primary" />
                <span className="font-bold text-lg">{h.temp}°C</span>
                <span className="text-xs text-blue-500 font-medium">{h.rainProb ?? 0}% rain</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
