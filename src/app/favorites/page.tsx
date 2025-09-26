'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Trash2, 
  Plus,
  PlaneTakeoff
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Destination, ItineraryItem } from '@/types';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';

export default function FavoritesPage() {
  const router = useRouter();
  const { state, removeFromFavorites, removeFromItinerary } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'itinerary'>('favorites');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Stato per destinazioni dinamiche create
  const [dynamicDestinations, setDynamicDestinations] = useState<Record<string, Destination>>({});

  // Funzione per rimuovere tutti i preferiti
  const removeAllFavorites = () => {
    resolvedFavorites.forEach((destination: Destination & { originalFavoriteId: string }) => {
      removeFromFavorites(destination.originalFavoriteId);
    });
    setShowConfirmDialog(false);
  };

  // Normalizza i preferiti provenienti dallo state: possono essere memorizzati come id, nomi o vecchie forme di oggetto.
  const normalizeKey = (raw: unknown) => {
    if (raw == null) return '';
    let s = String(raw).trim();
    if (s.includes(',')) s = s.split(',')[0].trim();
    return s.toLowerCase();
  };

  // Funzione per creare una destinazione dinamica
  const createDynamicDestination = async (name: string): Promise<Destination | null> => {
    try {
      // Controlla se abbiamo già creato questa destinazione
      if (dynamicDestinations[name]) {
        return dynamicDestinations[name];
      }

      // Prova a ottenere informazioni geografiche dettagliate come in LiveDestinations
      let geoData = null;
      let cityName = name;
      let country = 'Sconosciuto';
      let coordinates = { lat: 0, lng: 0 };
      
      try {
        const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(name)}&limit=1&lang=it`);
        if (geoRes.ok) {
          const geocode = await geoRes.json();
          const suggestion = geocode?.suggestions?.[0];
          if (suggestion) {
            // Usa la localizzazione italiana per i nomi
            cityName = (suggestion.name || '').split(',')[0].trim() || name;
            country = suggestion.country || suggestion.name.split(',').slice(1).join(',').trim() || 'Sconosciuto';
            coordinates = {
              lat: suggestion.lat || 0,
              lng: suggestion.lon || 0
            };
            geoData = suggestion;
          }
        }
      } catch (e) {
        console.warn('Errore geocoding:', e);
      }

      // Funzione per generare URL immagini affidabili come in LiveDestinations
      const getCityImage = (cityName: string, index: number = 0): string => {
        const cityImages: Record<string, string> = {
          // Città principali
          'Rome': 'https://images.unsplash.com/photo-1552832230-c0197040d963?w=800&h=600&fit=crop',
          'Roma': 'https://images.unsplash.com/photo-1552832230-c0197040d963?w=800&h=600&fit=crop',
          'Paris': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
          'Parigi': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
          'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
          'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
          'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
          'Londra': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
          'Barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
          'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop',
          'Prague': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop',
          'Praga': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop',
          'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop',
          'Florence': 'https://images.unsplash.com/photo-1691319683356-c8ac7f6647c1?w=800&h=600&fit=crop&auto=format&v=2',
          'Firenze': 'https://images.unsplash.com/photo-1691319683356-c8ac7f6647c1?w=800&h=600&fit=crop&auto=format&v=2',
          'Berlin': 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&h=600&fit=crop',
          'Berlino': 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&h=600&fit=crop',
          'Madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
          'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop',
          'Atene': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop',
          'Budapest': 'https://images.unsplash.com/photo-1518952071651-e4b9b5c93c6a?w=800&h=600&fit=crop',
          'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21530d92b9bb?w=800&h=600&fit=crop',
          'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
          'Sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop',
          'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
          'Hong Kong': 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&h=600&fit=crop',
          
          // Destinazioni mare/beach
          'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
          'Mykonos': 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop',
          'Ibiza': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
          'Nice': 'https://images.unsplash.com/photo-1572252821143-035ad3cdf51d?w=800&h=600&fit=crop',
          'Nizza': 'https://images.unsplash.com/photo-1572252821143-035ad3cdf51d?w=800&h=600&fit=crop',
          'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
          'Maldive': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
          'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
          'Cancun': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
          'Miami': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        };
        
        // Normalizza il nome della città per una ricerca più flessibile
        const normalizedCityName = cityName.toLowerCase()
          .replace(/[^a-z\s]/g, '') // rimuove caratteri speciali
          .trim();
        
        // Cerca per nome esatto della città
        const exactMatch = Object.keys(cityImages).find(key => {
          const normalizedKey = key.toLowerCase().replace(/[^a-z\s]/g, '').trim();
          return normalizedCityName.includes(normalizedKey) || normalizedKey.includes(normalizedCityName);
        });
        
        if (exactMatch) {
          return cityImages[exactMatch];
        }
        
        // Fallback finale con Picsum Photos (immagini di paesaggi) usando hash deterministico
        const hash = Math.abs(cityName.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0));
        const imageId = 100 + (hash % 900); // Genera ID tra 100-999
        return `https://picsum.photos/800/600?random=${imageId}`;
      };

      // Prova a ottenere immagine e descrizione dettagliata come in LiveDestinations
      // Preferisci un'immagine persistita se l'utente ha favorito questa città in passato
      let imageUrl = getCityImage(cityName, 0); // Usa fallback affidabile di default
      try {
        const favMapRaw = localStorage.getItem('travelmate-favorite-images');
        if (favMapRaw) {
          const favMap = JSON.parse(favMapRaw || '{}');
          const key = name.toLowerCase();
          // Try direct match by normalized id/name
          if (favMap && favMap[key]) {
            imageUrl = favMap[key];
          }
        }
      } catch (e) {
        // ignore storage errors
      }
      let apiDescription: string | null = null;
      
      try {
        const imgRes = await fetch(`/api/city-images?city=${encodeURIComponent(cityName)}`);
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          // Solo usa l'immagine dall'API se sembra affidabile
          if (imgData?.imageUrl && imgData.imageUrl.includes('unsplash.com')) {
            // Only overwrite if we don't have a persisted favorite image for this name
            try {
              const favMapRaw2 = localStorage.getItem('travelmate-favorite-images');
              const favMap2 = favMapRaw2 ? JSON.parse(favMapRaw2 || '{}') : {};
              const key2 = name.toLowerCase();
              if (!favMap2 || !favMap2[key2]) {
                imageUrl = imgData.imageUrl;
              }
            } catch (e) {
              imageUrl = imgData.imageUrl;
            }
          } else if (imgData?.fallbackUrl && imgData.fallbackUrl.includes('unsplash.com')) {
            try {
              const favMapRaw3 = localStorage.getItem('travelmate-favorite-images');
              const favMap3 = favMapRaw3 ? JSON.parse(favMapRaw3 || '{}') : {};
              const key3 = name.toLowerCase();
              if (!favMap3 || !favMap3[key3]) {
                imageUrl = imgData.fallbackUrl;
              }
            } catch (e) {
              imageUrl = imgData.fallbackUrl;
            }
          }
          // Altrimenti mantieni il fallback deterministico

          // Preferisci descrizione/titolo in Italiano quando fornito dall'API
          if (imgData.description) {
            apiDescription = imgData.description;
          } else if (imgData.longExtract) {
            apiDescription = imgData.longExtract;
          } else if (imgData.title && typeof imgData.title === 'string') {
            apiDescription = String(imgData.title);
          }
        }
      } catch (e) {
        console.warn('Errore recupero immagine:', e);
        // Mantieni il fallback deterministico già impostato
      }

      // Inferisci il tipo basandosi sul nome
      let inferredType: 'city' | 'beach' | 'mountain' | 'nature' | 'culture' | 'countryside' = 'city';
      const lowerName = name.toLowerCase();
      if (lowerName.includes('beach') || lowerName.includes('island') || lowerName.includes('bay')) {
        inferredType = 'beach';
      } else if (lowerName.includes('mountain') || lowerName.includes('peak') || lowerName.includes('alps')) {
        inferredType = 'mountain';
      } else if (lowerName.includes('park') || lowerName.includes('forest') || lowerName.includes('lake')) {
        inferredType = 'nature';
      } else if (lowerName.includes('museum') || lowerName.includes('temple') || lowerName.includes('cathedral')) {
        inferredType = 'culture';
      } else if (lowerName.includes('village') || lowerName.includes('countryside') || lowerName.includes('valley')) {
        inferredType = 'countryside';
      }

      const destination: Destination = {
        id: `dynamic-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
        name: cityName,
        country: country,
        continent: 'Unknown', // Potremo mappare questo in futuro se necessario
        type: inferredType,
        budget: 'medium' as const,
        image: imageUrl,
        images: [imageUrl],
        // Preferisci la descrizione localizzata (italiano) quando disponibile dall'API city-images
        description: apiDescription || `Scopri ${cityName} con la sua cultura, attrazioni ed esperienze uniche.`,
        bestTimeToVisit: ['Tutto l\'anno'],
        duration: '3-5 giorni',
        activities: [
          {
            id: '1',
            name: 'Esplorazione',
            description: 'Scopri i luoghi più interessanti',
            icon: '🗺️',
            duration: '2-3 ore'
          },
          {
            id: '2',
            name: 'Fotografia',
            description: 'Cattura i momenti più belli',
            icon: '📸',
            duration: '1-2 ore'
          },
          {
            id: '3',
            name: 'Relax',
            description: 'Goditi l\'atmosfera del luogo',
            icon: '🧘',
            duration: 'Libero'
          }
        ],
        coordinates: coordinates
      };

      // Salva la destinazione creata
      setDynamicDestinations(prev => ({ ...prev, [name]: destination }));
      return destination;
    } catch (error) {
      console.error('Errore nella creazione destinazione dinamica:', error);
      return null;
    }
  };

  // Gestisce la risoluzione di preferiti sia statici che dinamici
  const [resolvedFavorites, setResolvedFavorites] = useState<(Destination & { originalFavoriteId: string })[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  useEffect(() => {
    const resolveFavorites = async () => {
      setIsLoadingFavorites(true);
      const resolved: (Destination & { originalFavoriteId: string })[] = [];

      for (const favorite of state.favorites) {
        let favoriteId: string;
        let favoriteName: string;

        // Estrai ID e nome dal preferito
        if (favorite && typeof favorite === 'object') {
          favoriteId = (favorite as any).id || (favorite as any).name || String(favorite);
          favoriteName = (favorite as any).name || (favorite as any).id || String(favorite);
        } else {
          favoriteId = String(favorite);
          favoriteName = String(favorite);
        }

        // Try to reuse the same destination object used by the main destinations list.
        // 1) Check AppContext state.destinations
        // 2) Check global in-memory cache __GM_DESTINATIONS_CACHE (if present)
        // 3) Check dynamicDestinations
        // 4) Fallback to createDynamicDestination
        let destination: Destination | null = null;

        // 1) AppContext destinations
        if (!destination && state.destinations && state.destinations.length > 0) {
          destination = state.destinations.find(d => 
            d.id === favoriteId || 
            d.name.toLowerCase() === favoriteId.toLowerCase() ||
            d.name.toLowerCase() === favoriteName.toLowerCase()
          ) || null;
        }

        // 2) Global in-memory cache used by LiveDestinations
        if (!destination && typeof globalThis !== 'undefined') {
          try {
            const gmCache: Map<string, any[]> = (globalThis as any).__GM_DESTINATIONS_CACHE;
            if (gmCache && gmCache instanceof Map) {
              for (const arr of gmCache.values()) {
                if (Array.isArray(arr)) {
                  const found = arr.find((d: any) => {
                    if (!d) return false;
                    const nid = String(d.id || '').toLowerCase();
                    const nname = String(d.name || '').toLowerCase();
                    return nid === favoriteId.toLowerCase() || nname === favoriteId.toLowerCase() || nname === favoriteName.toLowerCase();
                  });
                  if (found) { destination = found as Destination; break; }
                }
              }
            }
          } catch (e) {
            // ignore cache errors
          }
        }

        // 3) dynamicDestinations
        if (!destination && dynamicDestinations[favoriteName]) {
          destination = dynamicDestinations[favoriteName];
        }

        // 4) create dynamic if still missing
        if (!destination) {
          const dynamicDest = await createDynamicDestination(favoriteName);
          if (dynamicDest) {
            destination = dynamicDest;
          }
        }

        if (destination) {
          // Try to prefer persisted image for this favorite, but keep the same object identity when possible
          try {
            const favMapRaw = localStorage.getItem('travelmate-favorite-images');
            if (favMapRaw) {
              const favMap = JSON.parse(favMapRaw || '{}');
              const key = (favoriteName || favoriteId || '').toLowerCase();
              if (favMap && favMap[key]) {
                // If destination object comes from state or cache, mutate image in-place to preserve identity
                try {
                  (destination as any).image = favMap[key];
                  (destination as any).images = [(favMap[key])];
                } catch (e) {
                  // fallback to creating a shallow copy if mutation is restricted
                  destination = { ...destination, image: favMap[key], images: [favMap[key]] } as Destination;
                }
              }
            }
          } catch (e) {
            // ignore storage errors
          }

          resolved.push({
            ...destination,
            originalFavoriteId: favoriteId
          });
        }
      }

      setResolvedFavorites(resolved);
      setIsLoadingFavorites(false);
    };

    resolveFavorites();
  }, [state.favorites, dynamicDestinations]);



  const itineraryWithDestinations = state.itinerary
    .map((item: ItineraryItem) => {
      let dest = null;
      if (state.destinations && state.destinations.length > 0) {
        dest = state.destinations.find(d => d.id === item.destinationId)
          || state.destinations.find(d => d.name.toLowerCase() === String(item.destinationId).toLowerCase())
          || null;
      }
      return { ...item, destination: dest };
    })
    .filter((item): item is ItineraryItem & { destination: Destination } => item.destination !== null);

  // Helper per navigazione coerente verso la pagina di dettaglio
  // Usa lat/lon se presenti (sia come top-level lat/lon che come coordinates.lat/coordinates.lng).
  

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
  // Helper per navigazione coerente verso la pagina di dettaglio
  // Usa lat/lon se presenti (sia come top-level lat/lon che come coordinates.lat/coordinates.lng).
  const navigateToDetails = (destination: Destination) => {
    try {
      const lat = (destination as any).lat ?? (destination as any).coordinates?.lat ?? null;
      const lon = (destination as any).lon ?? (destination as any).coordinates?.lng ?? (destination as any).coordinates?.lon ?? null;
      const hasCoords = lat !== null && lon !== null && !isNaN(Number(lat)) && !isNaN(Number(lon)) && Number(lat) !== 0 && Number(lon) !== 0;

      if (hasCoords) {
        const params = new URLSearchParams({ name: destination.name || '', lat: String(lat), lon: String(lon) });
        if ((destination as any).image) params.set('image', (destination as any).image);
        router.push(`/destinations/live?${params.toString()}`);
        return;
      }

      if (destination.id) {
        router.push(`/destinations/${destination.id}`);
        return;
      }

      // Fallback: cerca per nome
      router.push(`/destinations?search=${encodeURIComponent(destination.name || '')}`);
    } catch (e) {
      console.error('Navigation error for destination:', e);
      router.push(`/destinations?search=${encodeURIComponent(destination.name || '')}`);
    }
  };

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
            <nav className="-mb-px flex space-x-8 justify-between items-center">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'favorites'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Preferiti ({resolvedFavorites.length})</span>
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
              </div>
              
              {/* Pulsante rimuovi tutti preferiti */}
              {activeTab === 'favorites' && resolvedFavorites.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setShowConfirmDialog(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Rimuovi tutti</span>
                </motion.button>
              )}
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
              {isLoadingFavorites ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl animate-pulse">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : resolvedFavorites.length === 0 ? (
                <EmptyState type="favorites" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resolvedFavorites.map((destination: Destination & { originalFavoriteId: string }, index: number) => (
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
                      onClick={() => navigateToDetails(destination)}
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
                            removeFromFavorites(destination.originalFavoriteId);
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
                            <Button 
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2 shadow-lg"
                              onClick={(e) => { e.stopPropagation(); navigateToDetails(destination); }}
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
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => navigateToDetails(item.destination)}
                                >
                                  Scopri di più
                                </Button>
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

      {/* Modal di conferma per rimuovere tutti i preferiti */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Rimuovere tutti i preferiti?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Questa azione rimuoverà tutti i {resolvedFavorites.length} elementi dalla tua lista dei preferiti. 
                L&apos;operazione non può essere annullata.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Annulla
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={removeAllFavorites}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Rimuovi tutti
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}