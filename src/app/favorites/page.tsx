'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Star, 
  
  Trash2, 
  Plus,
  PlaneTakeoff
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Destination, ItineraryItem } from '@/types';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { destinations } from '@/data/destinations';
import { useApp } from '@/context/AppContext';

export default function FavoritesPage() {
  const router = useRouter();
  const { state, removeFromFavorites, removeFromItinerary } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'itinerary'>('favorites');


  // Normalizza i preferiti provenienti dallo state: possono essere memorizzati come id, nomi o vecchie forme di oggetto.
  const normalizeKey = (raw: unknown) => {
    if (raw == null) return '';
    let s = String(raw).trim();
    if (s.includes(',')) s = s.split(',')[0].trim();
    return s.toLowerCase();
  };

  const canonicalFavoriteIds = Array.from(new Set(state.favorites
    .map((f: any) => f)
    .map((val: any) => {
      // se è un oggetto con id
      if (val && typeof val === 'object') {
        if (val.id) return String(val.id);
        if (val.name) return String(val.name);
      }
      return String(val);
    })
    .map((s: string) => {
      const byId = destinations.find(d => d.id === s);
      if (byId) return byId.id;
      const key = normalizeKey(s);
      const byExact = destinations.find(d => d.name.toLowerCase() === key);
      if (byExact) return byExact.id;
      const byIncludes = destinations.find(d => d.name.toLowerCase().includes(key) || key.includes(d.name.toLowerCase()));
      if (byIncludes) return byIncludes.id;
      return null;
    })
    .filter(Boolean) as string[]
  ));

  // Helper per risolvere un singolo valore raw dei preferiti a scopo di debug
  const resolveRawFavorite = (val: any) => {
    if (val && typeof val === 'object') {
      if (val.id) return String(val.id);
      if (val.name) return String(val.name);
    }
    const s = String(val || '').trim();
    const byId = destinations.find(d => d.id === s);
    if (byId) return byId.id;
    const key = normalizeKey(s);
    const byExact = destinations.find(d => d.name.toLowerCase() === key);
    if (byExact) return byExact.id;
    const byIncludes = destinations.find(d => d.name.toLowerCase().includes(key) || key.includes(d.name.toLowerCase()));
    if (byIncludes) return byIncludes.id;
    return null;
  };

  const resolvedMap = state.favorites.map((f: any) => ({ raw: f, resolved: resolveRawFavorite(f) }));
  const unresolvedEntries = resolvedMap.filter(r => !r.resolved);
  const resolvedIds = resolvedMap.map(r => r.resolved).filter(Boolean) as string[];
  const [unresolvedImages, setUnresolvedImages] = useState<Record<string, string | null>>({});
  const unresolvedImageFor = (raw: any) => {
    const key = String(raw);
    return unresolvedImages[key] || null;
  };

  // Recupera immagini per le voci non risolte (tentativo migliorativo)
  useEffect(() => {
    const toFetch = unresolvedEntries.map(u => String(u.raw)).filter(k => !unresolvedImages[k]);
    if (toFetch.length === 0) return;

  toFetch.forEach(async (city) => {
      try {
        const res = await fetch(`/api/city-images?city=${encodeURIComponent(city)}`);
        if (!res.ok) throw new Error('no image');
        const j = await res.json();
        if (j?.imageUrl) {
          setUnresolvedImages(prev => ({ ...prev, [city]: j.imageUrl }));
          return;
        }
      } catch (e) {
        // ignora errori nella richiesta immagine
      }
      setUnresolvedImages(prev => ({ ...prev, [city]: null }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(unresolvedEntries)]);

  const favoriteDestinationsResolved = destinations.filter(d => canonicalFavoriteIds.includes(d.id));

  const itineraryWithDestinations = state.itinerary
    .map((item: ItineraryItem) => {
      const dest = destinations.find(d => d.id === item.destinationId)
        || destinations.find(d => d.name.toLowerCase() === String(item.destinationId).toLowerCase())
        || null;
      return { ...item, destination: dest };
    })
    .filter((item): item is ItineraryItem & { destination: Destination } => item.destination !== null);

  const EmptyState = ({ type }: { type: 'favorites' | 'itinerary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16"
    >
      <div className="text-6xl mb-4">
        {type === 'favorites' ? '💝' : '✈️'}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {type === 'favorites' ? 'Nessun preferito' : 'Nessun viaggio pianificato'}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        {type === 'favorites' 
          ? 'Inizia ad esplorare le destinazioni e aggiungi le tue preferite per trovarle facilmente qui!'
          : 'Aggiungi destinazioni al tuo itinerario per pianificare i tuoi prossimi viaggi.'}
      </p>
      <Link href="/destinations">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {type === 'favorites' ? 'Scopri Destinazioni' : 'Pianifica un Viaggio'}
        </Button>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Intestazione */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            I Miei Viaggi
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Gestisci i tuoi preferiti e pianifica i tuoi prossimi viaggi
          </p>
          
        </motion.div>

  {/* Schede */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'favorites'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span>Preferiti ({state.favorites.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'itinerary'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <PlaneTakeoff className="w-5 h-5" />
                <span>Itinerario ({state.itinerary.length})</span>
              </button>
            </nav>
          </div>
        </motion.div>

  {/* Contenuto */}
        <AnimatePresence mode="wait">
          {activeTab === 'favorites' ? (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {favoriteDestinationsResolved.length === 0 && unresolvedEntries.length === 0 ? (
                <EmptyState type="favorites" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteDestinationsResolved.map((destination: Destination, index: number) => (
                    <motion.div
                      key={destination.id}
                      initial={{ opacity: 0, y: 60, rotateY: -15 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotateY: 5,
                        transition: { duration: 0.2 }
                      }}
                      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                      onClick={() => router.push(`/destinations/${destination.id}`)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${destination.image}')` }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        
                        {/* Pulsante rimuovi */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromFavorites(destination.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute top-4 right-4 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg backdrop-blur-sm"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </motion.button>

                        {/* Badge valutazione */}
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold text-black dark:text-white">{destination.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                              {destination.name}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                              <MapPin className="w-4 h-4" />
                              {destination.country}
                            </div>
                          </div>
                          <div className="text-2xl">
                            {destination.type === 'beach' ? '🏖️' :
                             destination.type === 'mountain' ? '⛰️' :
                             destination.type === 'city' ? '🏙️' :
                             destination.type === 'culture' ? '🏛️' :
                             destination.type === 'nature' ? '🌿' : '🌾'}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {destination.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div />
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link href={`/destinations/${destination.id}`}>
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2 shadow-lg"
                              >
                                Dettagli
                              </Button>
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {unresolvedEntries.map((entry, i) => (
                    <motion.div
                      key={`unresolved-${i}-${String(entry.raw)}`}
                      initial={{ opacity: 0, y: 60, rotateY: -15 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: (favoriteDestinationsResolved.length + i) * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotateY: 5,
                        transition: { duration: 0.2 }
                      }}
                      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-cover bg-center bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-6xl"
                          style={{ backgroundImage: unresolvedImageFor(entry.raw) ? `url('${unresolvedImageFor(entry.raw)}')` : undefined }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {!unresolvedImageFor(entry.raw) && <div className="text-gray-500 dark:text-gray-400">📸</div>}
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Pulsante rimuovi per voci non risolte */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromFavorites(entry.raw);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute top-4 right-4 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg backdrop-blur-sm"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </motion.button>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                              {String(entry.raw)}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                              <MapPin className="w-4 h-4" />
                              —
                            </div>
                          </div>
                          <div className="text-2xl">🗺️</div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          Informazioni non disponibili per questa destinazione.
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div />
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2 shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Prova ad andare alla pagina live e passa il nome della città come query in modo che l'utente possa recuperare i dettagli
                                window.location.href = `/destinations/live?name=${encodeURIComponent(String(entry.raw))}`;
                              }}
                            >
                              Scopri di più
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {itineraryWithDestinations.length === 0 ? (
                <EmptyState type="itinerary" />
              ) : (
                <div className="space-y-6">
                  {itineraryWithDestinations.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Immagine della destinazione */}
                        <div className="lg:w-48 h-32 lg:h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${item.destination.image}')` }}
                          />
                        </div>

                        {/* Contenuto */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {item.destination.name}
                              </h3>
                              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{item.destination.country}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(item.startDate).toLocaleDateString('it-IT')} - 
                                    {new Date(item.endDate).toLocaleDateString('it-IT')}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span>{item.destination.rating}</span>
                                </div>
                              </div>
                              {item.notes && (
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                                  {item.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div />
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <Link href={`/destinations/${item.destination.id}`}>
                                  <Button size="sm" className="w-full">
                                    Dettagli
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromItinerary(item.id)}
                                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}