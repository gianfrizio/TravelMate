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
  const { setLastSearch, getLastSearch } = useApp();
  
  // Usa i parametri URL come single source of truth
  const searchQuery = searchParams?.get('search') || '';
  const continent = searchParams?.get('continent') || null;
  const type = searchParams?.get('type') || null;
  
  // Debug dei parametri URL
  console.log('🔍 DestinationsClient URL params:', { 
    allParams: searchParams?.toString(),
    searchQuery, 
    continent,
    type,
    continentRaw: searchParams?.get('continent'),
    typeRaw: searchParams?.get('type'),
    cleared: searchParams?.get('_cleared')
  });
  
  // Debug aggiuntivo per il tipo
  if (type) {
    console.log('🎯 Type filter active:', type);
  }
  
  // State temporaneo per la ricerca (solo durante la digitazione)
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);
  
  // Sincronizza tempSearchQuery quando searchQuery cambia (da URL)
  useEffect(() => {
    setTempSearchQuery(searchQuery);
  }, [searchQuery]);


  // Gestisce la pulizia dei parametri speciali (solo al cambio di searchParams)
  useEffect(() => {
    const fromLive = searchParams?.get('from_live') === '1';
    const cleared = searchParams?.get('_cleared') === '1';
    
    // Se stiamo tornando dalla live page, pulisci il parametro dall'URL
    if (fromLive) {
      const cleanParams = new URLSearchParams(searchParams?.toString());
      cleanParams.delete('from_live');
      const cleanUrl = cleanParams.toString();
      router.replace(`/destinations${cleanUrl ? `?${cleanUrl}` : ''}`);
      return;
    }
    
    // Se c'è il flag _cleared, rimuovilo e NON fare altro
    if (cleared) {
      const cleanParams = new URLSearchParams(searchParams?.toString());
      cleanParams.delete('_cleared');
      const cleanUrl = cleanParams.toString();
      router.replace(`/destinations${cleanUrl ? `?${cleanUrl}` : ''}`);
      return;
    }
  }, [searchParams, router]);

  // Gestisce il ripristino dello stato (solo al montaggio iniziale)
  useEffect(() => {
    const lastSearch = getLastSearch();
    const fromLive = searchParams?.get('from_live') === '1';
    const cleared = searchParams?.get('_cleared') === '1';
    
    // Solo se non ci sono parametri URL e non ci sono flag speciali, prova a ripristinare
    if (!searchQuery && !continent && !type && !fromLive && !cleared && lastSearch) {
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
    }
  }, []); // Esegui solo al montaggio iniziale

  // Salva lo stato corrente quando cambiano i parametri validi
  useEffect(() => {
    const cleared = searchParams?.get('_cleared') === '1';
    const fromLive = searchParams?.get('from_live') === '1';
    
    if (!cleared && !fromLive && (searchQuery || continent || type)) {
      setLastSearch(searchQuery, continent || '');
    }
    
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[DestinationsClient] searchParams', { raw: searchParams?.toString(), search: searchQuery, continent, type, cleared, fromLive });
    }
  }, [searchQuery, continent, type, searchParams, setLastSearch]);

  // Salva lo stato solo quando si naviga via o si chiude la pagina
  useEffect(() => {
    const saveStateOnUnload = () => {
      if (searchQuery || continent || type) {
        setLastSearch(searchQuery, continent || '');
      }
    };

    // Salva solo quando si naviga via o si chiude la pagina (non su ogni cambio di state)
    window.addEventListener('beforeunload', saveStateOnUnload);
    
    return () => {
      window.removeEventListener('beforeunload', saveStateOnUnload);
    };
  }, []); // Rimosso le dipendenze per evitare re-render continui
  
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const [countryFilter, setCountryFilter] = useState<string | null>(null);

  // Auto-aggiorna URL quando tempSearchQuery viene cancellato
  useEffect(() => {
    // Se l'utente ha cancellato tutto il testo e c'era una ricerca attiva, aggiorna l'URL
    if (tempSearchQuery.trim() === '' && searchQuery.trim() !== '') {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete('search');
      params.delete('focus');
      
      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newUrl);
    }
  }, [tempSearchQuery, searchQuery, searchParams, pathname, router]);

  const handleSearch = (queryOverride?: string) => {
    const searchTerm = queryOverride || tempSearchQuery.trim();
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (searchTerm) {
      params.set('search', searchTerm);
      params.set('focus', '1');
    } else {
      params.delete('search');
      params.delete('focus');
    }
    // preserve continent if present in select
    
    // Salva lo stato della ricerca solo quando si fa effettivamente una ricerca
    if (searchTerm) {
      setLastSearch(searchTerm, continent || '');
    }
    
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
                    onSelect={(s) => {
                      setTempSearchQuery(s.name);
                      // Avvia automaticamente la ricerca quando viene selezionato un suggerimento
                      handleSearch(s.name);
                    }}
                    onQueryChange={(q) => setTempSearchQuery(q)}
                    onEnter={() => handleSearch()}
                  />
                </Suspense>
              </div>
              {/* Filtri contestuali: continente e tipo */}
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
                      // Aggiungi un flag temporaneo per indicare che l'utente ha rimosso esplicitamente il filtro
                      params.set('_cleared', '1');
                    }
                    
                    // Salva lo stato quando cambia il continente (usa '' per indicare "nessun continente")
                    setLastSearch(searchQuery, v || '');
                    
                    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
                    router.replace(newUrl);
                  }}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
                >
                  <option value="">🌍 Tutti i continenti</option>
                  <option value="Europe">🌍 Europa</option>
                  <option value="Asia">🌏 Asia</option>
                  <option value="America">🌎 America</option>
                  <option value="Africa">🌍 Africa</option>
                  <option value="Oceania">🌍 Oceania</option>
                </select>

                <select
                  aria-label="Filtra per tipo"
                  value={type ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    const params = new URLSearchParams(searchParams?.toString() || '');
                    
                    console.log('🎯 Type filter changed to:', v);
                    
                    if (v) {
                      params.set('type', v);
                      params.set('focus', '1');
                    } else {
                      params.delete('type');
                      params.delete('focus');
                      // Aggiungi un flag temporaneo per indicare che l'utente ha rimosso esplicitamente il filtro
                      params.set('_cleared', '1');
                    }
                    
                    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
                    console.log('🔄 Updating URL for type filter:', newUrl);
                    router.push(newUrl);
                  }}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
                >
                  <option value="">🗺️ Tutti i tipi</option>
                  <option value="city">🏙️ Città</option>
                  <option value="nature">🌿 Natura</option>
                  <option value="culture">🏛️ Cultura</option>
                  <option value="beach">🏖️ Mare</option>
                  <option value="mountain">⛰️ Montagna</option>
                  <option value="countryside">🌾 Campagna</option>
                </select>
              </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSearch()}
                disabled={isLoading || !tempSearchQuery.trim()}
                className="border-white text-white dark:text-white bg-transparent hover:bg-white/10"
              >
                Cerca
              </Button>
            </div>
          </div>
          {(searchQuery || continent || type) && (
            <div className="mt-4 space-y-2">
              {searchQuery && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Risultati per: <strong>{searchQuery}</strong>
                  </p>
                  <button
                    onClick={() => {
                      setTempSearchQuery('');
                      handleSearch('');
                    }}
                    className="ml-3 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/30"
                    aria-label="Cancella ricerca"
                    title="Cancella ricerca"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {continent && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Continente: 🌍 <strong>{continent}</strong>
                  </p>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams?.toString() || '');
                      params.delete('continent');
                      params.set('_cleared', '1');
                      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
                      router.replace(newUrl);
                    }}
                    className="ml-3 text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-200 transition-colors p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800/30"
                    aria-label="Rimuovi filtro continente"
                    title="Rimuovi filtro continente"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {type && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Tipo: <strong>
                      {type === 'city' ? '🏙️ Città' :
                       type === 'nature' ? '🌿 Natura' :
                       type === 'culture' ? '🏛️ Cultura' :
                       type === 'beach' ? '🏖️ Mare' :
                       type === 'mountain' ? '⛰️ Montagna' :
                       type === 'countryside' ? '🌾 Campagna' : type}
                    </strong>
                  </p>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams?.toString() || '');
                      params.delete('type');
                      params.set('_cleared', '1');
                      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
                      router.replace(newUrl);
                    }}
                    className="ml-3 text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800/30"
                    aria-label="Rimuovi filtro tipo"
                    title="Rimuovi filtro tipo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
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
            <LiveDestinations searchQuery={searchQuery} continent={continent ?? undefined} type={type ?? undefined} maxItems={48} onLoading={(l) => setIsLoading(l)} />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
