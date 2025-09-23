'use client';

import { useState, useEffect, useMemo } from 'react';
import logger from '@/lib/logger';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Heart, 
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

type LiveDestination = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  image: string;
  rating: number;
  budget: 'low' | 'medium' | 'high';
  type: 'city' | 'beach' | 'mountain' | 'countryside';
  description: string;
};

const POPULAR_CITIES = [
  'Rome, Italy',
  'Paris, France', 
  'Tokyo, Japan',
  'New York, USA',
  'London, UK',
  'Barcelona, Spain',
  'Amsterdam, Netherlands',
  'Prague, Czech Republic',
  'Vienna, Austria',
  'Florence, Italy',
  'Santorini, Greece',
  'Bali, Indonesia',
  'Dubai, UAE',
  'Istanbul, Turkey',
  'Sydney, Australia',
  'Cape Town, South Africa',
  'Rio de Janeiro, Brazil',
  'Bangkok, Thailand',
  'Berlin, Germany',
  'Lisbon, Portugal'
];

// Funzione per generare URL immagini affidabili
const getCityImage = (cityName: string, index: number): string => {
  const cityImages: Record<string, string> = {
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197040d963?w=800&h=600&fit=crop',
    'Paris': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
    'Barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
    'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop',
    'Prague': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop',
    'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop',
    'Florence': 'https://images.unsplash.com/photo-1552831388-6a0b3575b32a?w=800&h=600&fit=crop',
    'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
    'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21530d92b9bb?w=800&h=600&fit=crop',
    'Sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'Cape Town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop',
    'Rio de Janeiro': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
    'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop',
    'Berlin': 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&h=600&fit=crop',
    'Lisbon': 'https://images.unsplash.com/photo-1588959594747-be64cd73874a?w=800&h=600&fit=crop'
  };
  
  // Cerca per nome esatto della città
  const exactMatch = Object.keys(cityImages).find(key => 
    cityName.toLowerCase().includes(key.toLowerCase())
  );
  
  if (exactMatch) {
    return cityImages[exactMatch];
  }
  
  // Fallback con Picsum Photos (più affidabile)
  const imageId = 100 + (index * 50) + (cityName.length * 3);
  return `https://picsum.photos/800/600?random=${imageId}`;
};

// Componente per gestire il caricamento delle immagini con fallback
const CityImage = ({ src, alt, cityName }: { src: string; alt: string; cityName: string }) => {
  const [imageError, setImageError] = useState(false);

  // Use next/image for optimized loading. We set layout via parent container and provide width/height hints.
  if (imageError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-6xl font-bold opacity-80">
          {cityName[0]}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      onLoadingComplete={() => { /* no-op, keeps previous behavior */ }}
      onError={() => setImageError(true)}
      priority={false}
      // Allow external domains in next.config (images config already expected)
    />
  );
};

export default function LiveDestinations({ searchQuery = '', maxItems, variant = 'default', onLoading }: { 
  searchQuery?: string; 
  maxItems?: number; 
  variant?: 'default' | 'hero',
  onLoading?: (loading: boolean) => void
}) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useApp();
  const router = useRouter();
  const [destinations, setDestinations] = useState<LiveDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const seedParam = searchParams?.get('seed') || undefined;

  // Seeded RNG (mulberry32)
  const mulberry32 = (a: number) => {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const hashStringToInt = (str: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }
    return h >>> 0;
  };

  const seededShuffle = (arr: string[], seed?: string) => {
    // If no seed is provided, perform a true random Fisher-Yates shuffle so results vary between loads
    const a = arr.slice();
    if (!seed) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    // Seeded deterministic shuffle (mulberry32) when a seed is provided
    const rng = mulberry32(hashStringToInt(seed));
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      onLoading?.(true);
      setError(null);

      try {
        const citiesToFetch = searchQuery.trim()
          ? [searchQuery]
          : seededShuffle(POPULAR_CITIES, seedParam).slice(0, maxItems || 12);

        // Simple in-memory caches to avoid repeat lookups during the session
        const geocodeCache: Map<string, any> = (globalThis as any).__GM_GEOCODE_CACHE || new Map();
        (globalThis as any).__GM_GEOCODE_CACHE = geocodeCache;

        const imageCache: Map<string, string> = (globalThis as any).__GM_IMAGE_CACHE || new Map();
        (globalThis as any).__GM_IMAGE_CACHE = imageCache;

        // Concurrency control: batch size
        const BATCH_SIZE = 4;

        const fetchForCity = async (city: string, index: number) => {
          // geocode
          let geocode = geocodeCache.get(city);
          if (!geocode) {
            try {
              // Request geocoding in Italian so formatted name/country are localized
              const response = await fetch(`/api/geocode?q=${encodeURIComponent(city)}&limit=1&lang=it`);
              geocode = await response.json();
              geocodeCache.set(city, geocode);
            } catch (err) {
              logger.warn(`Failed to fetch geocode for ${city}:`, err);
              return null;
            }
          }

          const suggestion = geocode?.suggestions?.[0];
          if (!suggestion) return null;

          // Suggestion.name is localized (e.g., "Roma, Italia") when lang=it
          const cityName = (suggestion.name || '').split(',')[0].trim();
          // Prefer an explicit country field if provided by geocode route
          const country = suggestion.country || suggestion.name.split(',').slice(1).join(',').trim() || 'Unknown';

          // image + localized description
          let imageUrl = imageCache.get(cityName);
          let apiDescription: string | null = null;
          if (!imageUrl) {
            imageUrl = getCityImage(cityName, index) as string;
            try {
              const imageResponse = await fetch(`/api/city-images?city=${encodeURIComponent(cityName)}`);
              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                if (imageData.imageUrl) imageUrl = imageData.imageUrl;
                else if (imageData.fallbackUrl) imageUrl = imageData.fallbackUrl;

                // Prefer Italian description/title when provided by the API
                if (imageData.description) apiDescription = imageData.description;
                else if (imageData.longExtract) apiDescription = imageData.longExtract;
                else if (imageData.title && typeof imageData.title === 'string') {
                  // sometimes the summary is short — use it as a minimal description
                  apiDescription = String(imageData.title);
                }
              }
            } catch (imgError) {
              logger.warn(`Failed to fetch AI image for ${cityName}:`, imgError);
            }
            imageCache.set(cityName, String(imageUrl));
          } else {
            // If image was cached previously, no apiDescription available — leave null
          }

          return {
            id: suggestion.id,
            name: cityName,
            country,
            lat: suggestion.lat,
            lon: suggestion.lon,
            image: imageUrl,
            rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
            
            budget: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
            type: Math.random() > 0.7 ? 'beach' : Math.random() > 0.5 ? 'mountain' : 'city',
            // Prefer localized description (Italian) when available from city-images API
            description: apiDescription || `Scopri ${cityName} con la sua cultura, attrazioni ed esperienze uniche.`
          } as LiveDestination;
        };

        const tasks: Promise<LiveDestination | null>[] = [];
        for (let i = 0; i < citiesToFetch.length; i++) {
          tasks.push(fetchForCity(citiesToFetch[i], i));
          // If reached batch size or end, await batch
          if (tasks.length >= BATCH_SIZE || i === citiesToFetch.length - 1) {
            // run batch in parallel
                // append non-null results and deduplicate by id
                const results = await Promise.all(tasks);
                const valid = results.filter(Boolean) as LiveDestination[];
                setDestinations((prev) => {
                  const combined = prev.concat(valid);
                  const seen = new Set<string>();
                    // Deduplicate by id, normalized name, or proximity (within ~1km)
                    const seenNames = new Set<string>();
                    const kept: LiveDestination[] = [];
                    const isNearby = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                      const toRad = (v: number) => (v * Math.PI) / 180;
                      const R = 6371; // km
                      const dLat = toRad(lat2 - lat1);
                      const dLon = toRad(lon2 - lon1);
                      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                      const d = R * c;
                      return d <= 1.0; // within 1 km
                    };

                    const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

                    for (const d of combined) {
                      if (seen.has(d.id)) continue;
                      const n = normalize(d.name || '');
                      if (seenNames.has(n)) continue;
                      // check proximity to any kept destination
                      let prox = false;
                      for (const k of kept) {
                        if (d.lat && d.lon && k.lat && k.lon && isNearby(d.lat, d.lon, k.lat, k.lon)) {
                          prox = true;
                          break;
                        }
                      }
                      if (prox) continue;

                      seen.add(d.id);
                      seenNames.add(n);
                      kept.push(d);
                    }

                    return kept;
                });
            // clear tasks
            tasks.length = 0;
          }
        }
      } catch (err) {
        setError('Failed to load destinations');
        logger.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
        onLoading?.(false);
      }
    };

    // reset destinations before fetching
    setDestinations([]);
    fetchDestinations();
  }, [searchQuery, seedParam]);

  // Use destination name when calling add/remove so AppContext can resolve to the canonical dataset id
  const toggleFavorite = (destination: LiveDestination) => {
    const ident = destination.name || destination.id;
    if (isFavorite(ident)) {
      removeFromFavorites(ident);
    } else {
      addToFavorites(ident);
    }
  };

  if (loading) {
    // Skeleton grid while loading
    const skeletonCount = variant === 'hero' ? 3 : 6;
    return (
      <div className={`grid ${variant === 'hero' ? 'grid-cols-1 md:grid-cols-3 gap-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'} pb-12`}> 
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl h-80" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Error Loading Destinations
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No destinations found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try searching for a different location
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${variant === 'hero' ? 'grid-cols-1 md:grid-cols-3 gap-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'} pb-12`}>
      <AnimatePresence>
        {destinations.map((destination, index) => (
          <motion.div
            key={destination.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
              variant === 'hero' 
                ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/20 dark:border-gray-700/50' 
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="relative h-64 overflow-hidden">
              <CityImage
                src={destination.image}
                alt={`${destination.name}, ${destination.country}`}
                cityName={destination.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(destination)}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isFavorite(destination.name) 
                      ? 'text-red-500 fill-current' 
                      : 'text-gray-800'
                  }`} 
                />
              </button>

              {/* Rating Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{destination.rating}</span>
              </div>

              {/* Budget Badge */}
              <div className="absolute bottom-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                  destination.budget === 'low' ? 'bg-green-500' :
                  destination.budget === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {destination.budget === 'low' ? 'Economico' :
                   destination.budget === 'medium' ? 'Medio' : 'Alto'}
                </span>
              </div>

              {/* Live Data Badge */}
              <div className="absolute top-4 right-16">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/90 backdrop-blur-sm text-white border border-green-400/50">
                  🟢 Live
                </span>
              </div>
            </div>
            
            <div className={`p-6 ${variant === 'hero' ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm' : 'bg-white dark:bg-gray-800'}`}>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 mb-3">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium">{destination.country}</span>
                <span className="text-xs bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                  {destination.type === 'beach' ? '🏖️ Mare' :
                   destination.type === 'mountain' ? '⛰️ Montagna' :
                   destination.type === 'city' ? '🏙️ Città' : '🌾 Campagna'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {destination.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm leading-relaxed">
                {destination.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div />
                <Button 
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2"
                  onClick={() => {
                    // Client-side navigation to live details — include chosen image URL so detail shows the same photo
                    const params = new URLSearchParams({ name: destination.name, lat: String(destination.lat), lon: String(destination.lon) });
                    if (destination.image) params.set('image', destination.image);
                    router.push(`/destinations/live?${params.toString()}`);
                  }}
                >
                  Scopri di più
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
