import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Layers, MapPin } from 'lucide-react';
import { getMockAlerts } from '../services/alertService';
import L from 'leaflet';

// Fix for default leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export default function LiveMap() {
  const [activeLayer, setActiveLayer] = useState<'radar' | 'alerts'>('alerts');
  const alerts = getMockAlerts();

  // Coordinates for India
  const center: [number, number] = [22.9734, 78.6569];
  const defaultZoom = 5;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative rounded-xl overflow-hidden border shadow-sm">
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <Card className="bg-background/90 backdrop-blur-sm border-none shadow-md">
          <CardContent className="p-2 flex flex-col gap-2">
            <Button 
              variant={activeLayer === 'alerts' ? 'default' : 'ghost'} 
              size="sm" 
              className="justify-start w-32"
              onClick={() => setActiveLayer('alerts')}
            >
              <MapPin className="mr-2 h-4 w-4" /> Alerts
            </Button>
            <Button 
              variant={activeLayer === 'radar' ? 'default' : 'ghost'} 
              size="sm" 
              className="justify-start w-32"
              onClick={() => setActiveLayer('radar')}
            >
              <Layers className="mr-2 h-4 w-4" /> Radar
            </Button>
          </CardContent>
        </Card>
      </div>

      <MapContainer 
        center={center} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {activeLayer === 'alerts' && alerts.map(alert => (
          <Marker position={[26.1542, 85.8918]} key={alert.id}> {/* Mock coords for Darbhanga */}
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-red-600">{alert.hazard}</h3>
                <p className="text-sm mt-1">{alert.description}</p>
                <div className="mt-2 text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded inline-block">
                  Severity: {alert.severity}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {activeLayer === 'radar' && (
          <CircleMarker center={[26.1542, 85.8918]} radius={50} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}>
            <Popup>Heavy rain radar signature</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
