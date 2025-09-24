"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import LocationSearch from '@/components/LocationSearch';
import LiveDestinations from '@/components/LiveDestinations';

export default function DestinationsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  // Legge il parametro di ricerca dall'URL all'inizio 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get('search') || '';
      setSearchQuery(s);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegenerate = () => {
    const seed = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000).toString(36)}`;
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    params.set('seed', seed);
    // push il nuovo URL senza ricaricare completamente
    router.push(`/destinations?${params.toString()}`);
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
                  <LocationSearch onSelect={(s) => setSearchQuery(s.name)} />
                </Suspense>
              </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                disabled={!searchQuery}
              >
                Resetta ricerca
              </Button>
              <Button variant="outline" onClick={handleRegenerate} disabled={isLoading}>
                {isLoading ? 'Ricaricando...' : 'Ricarica'}
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
            <LiveDestinations searchQuery={searchQuery} onLoading={(l) => setIsLoading(l)} />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}