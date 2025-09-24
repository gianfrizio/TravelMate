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
    // Permettiamo il fetch sia tramite coordinate (lat && lng) SIA tramite nome della località
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
  // Forza un nuovo fetch resettando weatherData e permettendo all'useEffect di rieseguire
  setWeatherData(null);
  setError(null);
  // Nota: l'effetto dipende da lat/lng/location, quindi assicurati che il chiamante fornisca almeno location o coordinate
    }
  };
}