import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserLocation {
  lat: number;
  lon: number;
  name: string;
  source: 'gps' | 'fallback';
}

interface LocationContextValue {
  location: UserLocation;
  locating: boolean;
  error: string;
  refreshLocation: () => void;
}

const fallbackLocation: UserLocation = {
  lat: 26.1542,
  lon: 85.8918,
  name: 'Darbhanga, Bihar',
  source: 'fallback',
};

const LocationContext = createContext<LocationContextValue | null>(null);

const getSavedLocation = (): UserLocation => {
  try {
    const saved = localStorage.getItem('weathergpt:user-location');
    if (!saved) return fallbackLocation;

    const parsed = JSON.parse(saved);
    if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number' && parsed.name) {
      return parsed;
    }
  } catch {
    // Ignore invalid saved location and use the default city.
  }

  return fallbackLocation;
};

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(getSavedLocation);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const updateLocation = (nextLocation: UserLocation) => {
    setLocation(nextLocation);
    localStorage.setItem('weathergpt:user-location', JSON.stringify(nextLocation));
  };

  const refreshLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Location is not supported in this browser.');
      updateLocation(fallbackLocation);
      return;
    }

    setLocating(true);
    setError('');
    let settled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setError('Location permission is still pending.');
      updateLocation(fallbackLocation);
      setLocating(false);
    }, 12000);

    navigator.geolocation.getCurrentPosition(
      position => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        updateLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: 'Your Location',
          source: 'gps',
        });
        setLocating(false);
      },
      () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        setError('Location permission was denied or unavailable.');
        updateLocation(fallbackLocation);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000,
      }
    );
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const value = useMemo(
    () => ({ location, locating, error, refreshLocation }),
    [location, locating, error]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used inside LocationProvider');
  }

  return context;
};
