'use client';

import { useState, useEffect } from 'react';
import { WeatherData } from '@/types';

interface UseWeatherProps {
  lat?: number;
  lng?: number;
  location?: string;
}

export function useWeather({ lat, lng, location }: UseWeatherProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We allow fetching by either coordinates (lat && lng) OR by location name
    if ((!lat || !lng) && !location) return;

    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (lat !== undefined && lng !== undefined) {
          params.set('lat', String(lat));
          params.set('lng', String(lng));
        }
        if (location) params.set('location', location);

  const response = await fetch(`/api/weather?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Errore nel recupero dati meteo');
        }

        const data: WeatherData = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng, location]);

  return {
    weatherData,
    isLoading,
    error,
    refetch: () => {
      // Trigger a refetch by resetting weatherData and letting effect run again
      setWeatherData(null);
      setError(null);
      // Note: the effect depends on lat/lng/location, so ensure caller provides at least location or coords
    }
  };
}