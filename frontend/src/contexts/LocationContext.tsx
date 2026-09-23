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

const resolveLocationName = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.county || address.district;
    const state = address.state;

    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    if (data.display_name) return String(data.display_name).split(',').slice(0, 2).join(',').trim();
  } catch (error) {
    console.warn('Could not resolve location name:', error);
  }

  return 'Your Location';
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
      async position => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const name = await resolveLocationName(lat, lon);

        updateLocation({
          lat,
          lon,
          name,
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
