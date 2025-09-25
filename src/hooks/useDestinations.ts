'use client';

import { useState, useEffect } from 'react';
import { Destination } from '@/types';

// Hook per gestire le destinazioni dinamiche unificate
export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Chiama l'API che restituisce destinazioni dinamiche
        const response = await fetch('/api/destinations');
        if (!response.ok) {
          throw new Error('Failed to fetch destinations');
        }
        
        const data = await response.json();
        setDestinations(data.destinations || []);
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback alle destinazioni statiche in caso di errore
        try {
          const { destinations: staticDestinations } = await import('@/data/destinations');
          setDestinations(staticDestinations);
        } catch (fallbackErr) {
          console.error('Error loading fallback destinations:', fallbackErr);
          setDestinations([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const findDestination = (identifier: string): Destination | undefined => {
    const id = identifier.toLowerCase();
    
    // Cerca per ID esatto
    let found = destinations.find(d => d.id === identifier);
    if (found) return found;
    
    // Cerca per nome esatto (case insensitive)
    found = destinations.find(d => d.name.toLowerCase() === id);
    if (found) return found;
    
    // Cerca per nome parziale
    found = destinations.find(d => 
      d.name.toLowerCase().includes(id) || 
      id.includes(d.name.toLowerCase())
    );
    
    return found;
  };

  const getDestinationsByType = (type: string): Destination[] => {
    return destinations.filter(d => d.type === type);
  };

  const getDestinationsByContinent = (continent: string): Destination[] => {
    return destinations.filter(d => d.continent === continent);
  };

  const searchDestinations = (query: string): Destination[] => {
    const q = query.toLowerCase();
    return destinations.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    );
  };

  return {
    destinations,
    loading,
    error,
    findDestination,
    getDestinationsByType,
    getDestinationsByContinent,
    searchDestinations
  };
}