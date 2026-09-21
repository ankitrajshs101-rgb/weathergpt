import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Layers, MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';

// Fix for default leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CityWeather {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  wind: number;
}

const CITIES = [
  { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Darbhanga', lat: 26.1542, lon: 85.8918 }
];

export default function LiveMap() {
  const [activeLayer, setActiveLayer] = useState<'weather' | 'radar'>('weather');
  const [cityData, setCityData] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const promises = CITIES.map(async city => {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,wind_speed_10m`);
          const data = await res.json();
          return {
            ...city,
            temp: data.current.temperature_2m,
            wind: data.current.wind_speed_10m
          };
        });
        const results = await Promise.all(promises);
        setCityData(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const center: [number, number] = [22.9734, 78.6569];
  const defaultZoom = 5;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative rounded-xl overflow-hidden border shadow-sm">
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <Card className="bg-background/90 backdrop-blur-sm border-none shadow-md">
          <CardContent className="p-2 flex flex-col gap-2">
            <Button 
              variant={activeLayer === 'weather' ? 'default' : 'ghost'} 
              size="sm" 
              className="justify-start w-36"
              onClick={() => setActiveLayer('weather')}
            >
              <MapPin className="mr-2 h-4 w-4" /> Live Weather
            </Button>
            <Button 
              variant={activeLayer === 'radar' ? 'default' : 'ghost'} 
              size="sm" 
              className="justify-start w-36"
              onClick={() => setActiveLayer('radar')}
            >
              <Layers className="mr-2 h-4 w-4" /> Precipitation (GFS)
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-4 left-4 z-[400]">
        <Card className="bg-background/90 backdrop-blur-sm border-none shadow-md">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-bold">Dynamic Legend (IEEE Ref)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 text-xs space-y-1">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> &gt; 35°C (High Heat)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> 25-35°C (Moderate)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> &lt; 25°C (Cool)</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <MapContainer 
          center={center} 
          zoom={defaultZoom} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap & GFS Data'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {activeLayer === 'weather' && cityData.map(city => (
            <CircleMarker 
              key={city.name}
              center={[city.lat, city.lon]} 
              radius={12} 
              pathOptions={{ 
                color: city.temp > 35 ? 'red' : city.temp > 25 ? 'orange' : 'blue',
                fillColor: city.temp > 35 ? 'red' : city.temp > 25 ? 'orange' : 'blue',
                fillOpacity: 0.6
              }}
            >
              <Popup>
                <div className="p-1 min-w-[120px]">
                  <h3 className="font-bold text-lg">{city.name}</h3>
                  <div className="mt-2 text-sm">
                    <strong>Temp:</strong> {city.temp}°C<br/>
                    <strong>Wind:</strong> {city.wind} km/h
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {activeLayer === 'radar' && cityData.map(city => (
             <CircleMarker 
             key={city.name}
             center={[city.lat, city.lon]} 
             radius={40} 
             pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1, dashArray: '5, 5' }}
           >
             <Popup>Simulated Radar Coverage Area</Popup>
           </CircleMarker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
