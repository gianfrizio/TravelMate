"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import LocationSearch from '@/components/LocationSearch';
import LiveDestinations from '@/components/LiveDestinations';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function DestinationsClient() {
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [continent, setContinent] = useState<string | null>(null);
  const { setLastSearch, getLastSearch } = useApp();
  // Inizializza con l'ultimo stato di ricerca salvato se disponibile
  useEffect(() => {
    const lastSearch = getLastSearch();
    const urlSearch = searchParams?.get('search') || '';
    const urlContinent = searchParams?.get('continent') || null;
    const fromLive = searchParams?.get('from_live') === '1';
    
    // Se stiamo tornando dalla live page, pulisci il parametro dall'URL
    if (fromLive) {
      const cleanParams = new URLSearchParams(searchParams?.toString());
      cleanParams.delete('from_live');
      const cleanUrl = cleanParams.toString();
      router.replace(`/destinations${cleanUrl ? `?${cleanUrl}` : ''}`);
    }
    
    // Se non ci sono parametri URL ma c'è uno stato salvato, usa quello
    if (!urlSearch && !urlContinent && lastSearch && !fromLive) {
      setSearchQuery(lastSearch.query);
      setContinent(lastSearch.continent || null);
      
      // Opzionalmente aggiorna l'URL per riflettere lo stato ripristinato
      const params = new URLSearchParams();
      if (lastSearch.query) {
        params.set('search', lastSearch.query);
      }
      if (lastSearch.continent) {
        params.set('continent', lastSearch.continent);
      }
      if (params.toString()) {
        router.replace(`/destinations?${params.toString()}`);
      }
    } else {
      // Usa i parametri URL come prima
      const focusFlag = searchParams?.get('focus') === '1';
      if (urlContinent) {
        setSearchQuery('');
      } else {
        setSearchQuery(urlSearch);
      }
      setContinent(urlContinent);
      
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[DestinationsClient] searchParams', { raw: searchParams?.toString(), search: urlSearch, continent: urlContinent, focus: focusFlag, fromLive });
      }
    }
  }, [searchParams, getLastSearch, router]);

  // Salva lo stato automaticamente quando la pagina cambia
  useEffect(() => {
    const saveStateOnUnload = () => {
      if (searchQuery || continent) {
        setLastSearch(searchQuery, continent || '');
      }
    };

    // Salva quando si naviga via o si chiude la pagina
    window.addEventListener('beforeunload', saveStateOnUnload);
    
    return () => {
      window.removeEventListener('beforeunload', saveStateOnUnload); 
      // Salva anche quando il componente si unmonta
      saveStateOnUnload();
    };
  }, [searchQuery, continent, setLastSearch]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const [countryFilter, setCountryFilter] = useState<string | null>(null);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (searchQuery) {
      params.set('search', searchQuery);
      params.set('focus', '1');
    } else {
      params.delete('search');
      params.delete('focus');
    }
    // preserve continent if present in select
    
    // Salva lo stato corrente della ricerca
    setLastSearch(searchQuery, continent || '');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Esplora le Destinazioni
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Scopri destinazioni incredibili da tutto il mondo con dati in tempo reale
          </p>
        </motion.div>

        {/* Controlli ricerca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Suspense fallback={<div className="h-12" />}>
                  <LocationSearch
                    initialQuery={searchQuery}
                    onSelect={(s) => setSearchQuery(s.name)}
                    onQueryChange={(q) => setSearchQuery(q)}
                    onEnter={() => handleSearch()}
                  />
                </Suspense>
              </div>
              {/* Filtri contestuali: continente (solo select). Non prefillare la search con il continente. */}
              <div className="flex items-center gap-2">
                <select
                  aria-label="Filtra per continente"
                  value={continent ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    const params = new URLSearchParams(searchParams?.toString() || '');
                    if (v) {
                      params.set('continent', v);
                      params.set('focus', '1');
                    } else {
                      params.delete('continent');
                      params.delete('focus');
                    }
                    
                    // Salva lo stato quando cambia il continente
                    setLastSearch(searchQuery, v);
                    
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
                >
                  <option value="">Tutti i continenti</option>
                  <option value="Europe">Europa</option>
                  <option value="Asia">Asia</option>
                  <option value="America">America</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSearch}
                disabled={isLoading || !searchQuery}
                className="border-white text-white dark:text-white bg-transparent hover:bg-white/10"
              >
                Cerca
              </Button>
            </div>
          </div>
          {searchQuery && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Risultati per: <strong>{searchQuery}</strong>
              </p>
            </div>
          )}
        </motion.div>

        {/* Destinazioni live */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Suspense fallback={<div className="grid grid-cols-3 gap-6 py-12">{Array.from({length:3}).map((_,i)=>(<div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl h-80"/>))}</div>}>
            <LiveDestinations searchQuery={searchQuery} continent={continent ?? undefined} maxItems={24} onLoading={(l) => setIsLoading(l)} />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
