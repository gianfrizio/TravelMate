// Fallback con Picsum Photos (più affidabile)
// Componente per gestire il caricamento delle immagini con fallback
  // Usa next/image per il caricamento ottimizzato. Impostiamo il layout tramite il contenitore padre e forniamo suggerimenti su width/height.
  // RNG con seed (mulberry32)
  // Se non viene fornito un seed, esegui uno shuffle Fisher-Yates casuale in modo che i risultati varino tra i caricamenti
  // Shuffle deterministico con seed (mulberry32) quando viene fornito un seed
  // Semplici cache in memoria per evitare ricerche ripetute durante la sessione
  // Controllo di concorrenza: dimensione del batch
          // geocoding
              // Richiedi geocoding in italiano così il nome/country formattato saranno localizzati
  // Controllo di concorrenza: dimensione del batch
  // resetta le destinazioni prima del fetch
  // Usa il nome della destinazione quando chiami add/remove così AppContext può risolvere all'id canonico del dataset
                    // Navigazione client-side verso i dettagli live — includi l'URL dell'immagine scelta così il dettaglio mostra la stessa foto
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
import countryToContinent from '@/data/countryToContinent.json';

// Map common country abbreviations / short forms to the full names used in our dataset
const COUNTRY_ALIASES: Record<string, string> = {
  // common long/short names
  'usa': 'united states',
  'u.s.a': 'united states',
  'u.s.': 'united states',
  'us': 'united states',
  'uk': 'united kingdom',
  'u.k.': 'united kingdom',
  'gb': 'united kingdom',
  'great britain': 'united kingdom',
  'england': 'united kingdom',
  'uae': 'united arab emirates',
  'ivory coast': "côte d'ivoire",
  'south korea': 'south korea',
  'north korea': 'north korea',
  'russia': 'russia',
  // common ISO codes mapped to full country name used in dataset
  'ae': 'united arab emirates',
  'it': 'italy',
  'fr': 'france',
  'nl': 'netherlands',
  'es': 'spain',
  'pt': 'portugal',
  'de': 'germany',
  'br': 'brazil',
  'za': 'south africa',
  'au': 'australia',
  'jp': 'japan',
  'cn': 'china',
};

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
  'Milan, Italy',
  'Venice, Italy',
  'Florence, Italy',
  'Naples, Italy',
  'Turin, Italy',
  'Paris, France', 
  'Nice, France',
  'Lyon, France',
  'Marseille, France',
  'Bordeaux, France',
  'Tokyo, Japan',
  'Osaka, Japan',
  'Kyoto, Japan',
  'Sapporo, Japan',
  'Nagoya, Japan',
  'New York, USA',
  'Los Angeles, USA',
  'San Francisco, USA',
  'Chicago, USA',
  'Miami, USA',
  'Seattle, USA',
  'London, UK',
  'Edinburgh, UK',
  'Manchester, UK',
  'Bristol, UK',
  'Barcelona, Spain',
  'Madrid, Spain',
  'Valencia, Spain',
  'Seville, Spain',
  'Bilbao, Spain',
  'Amsterdam, Netherlands',
  'Rotterdam, Netherlands',
  'Prague, Czech Republic',
  'Budapest, Hungary',
  'Vienna, Austria',
  'Salzburg, Austria',
  'Santorini, Greece',
  'Athens, Greece',
  'Bali, Indonesia',
  'Borneo, Indonesia',
  'Jakarta, Indonesia',
  'Kuala Lumpur, Malaysia',
  'Singapore, Singapore',
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Istanbul, Turkey',
  'Antalya, Turkey',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Perth, Australia',
  'Brisbane, Australia',
  'Adelaide, Australia',
  'Canberra, Australia',
  'Gold Coast, Australia',
  'Darwin, Australia',
  'Auckland, New Zealand',
  'Wellington, New Zealand',
  'Christchurch, New Zealand',
  'Queenstown, New Zealand',
  'Suva, Fiji',
  'Nadi, Fiji',
  'Port Moresby, Papua New Guinea',
  'Noumea, New Caledonia',
  'Cape Town, South Africa',
  'Johannesburg, South Africa',
  'Durban, South Africa',
  'Cairo, Egypt',
  'Marrakech, Morocco',
  'Casablanca, Morocco',
  'Lagos, Nigeria',
  'Nairobi, Kenya',
  'Addis Ababa, Ethiopia',
  'Accra, Ghana',
  'Tunis, Tunisia',
  'Algiers, Algeria',
  'Dakar, Senegal',
  'Kigali, Rwanda',
  'Lusaka, Zambia',
  'Harare, Zimbabwe',
  'Rio de Janeiro, Brazil',
  'São Paulo, Brazil',
  'Brasília, Brazil',
  'Buenos Aires, Argentina',
  'Lima, Peru',
  'Santiago, Chile',
  'Bogotá, Colombia',
  'Mexico City, Mexico',
  'Cancún, Mexico',
  'Bangkok, Thailand',
  'Phuket, Thailand',
  'Hanoi, Vietnam',
  'Ho Chi Minh City, Vietnam',
  'Beijing, China',
  'Shanghai, China',
  'Hong Kong, Hong Kong',
  'Seoul, South Korea',
  'Busan, South Korea',
  'Berlin, Germany',
  'Munich, Germany',
  'Hamburg, Germany',
  'Lisbon, Portugal',
  'Porto, Portugal'
];

// When the UI requests 'all continents' show a curated list of globally-known major cities
const MAJOR_GLOBAL_CITIES = [
  'New York, USA',
  'London, UK',
  'Paris, France',
  'Tokyo, Japan',
  'Dubai, UAE',
  'Singapore, Singapore',
  'Barcelona, Spain',
  'Rome, Italy',
  'Bangkok, Thailand',
  'Hong Kong, Hong Kong',
  'Sydney, Australia',
  'Los Angeles, USA',
  'San Francisco, USA',
  'Istanbul, Turkey',
  'Rio de Janeiro, Brazil',
  'Cape Town, South Africa',
  'Cairo, Egypt',
  'Marrakech, Morocco',
  'Nairobi, Kenya',
  'Melbourne, Australia',
  'Auckland, New Zealand',
  'Moscow, Russia',
  'Toronto, Canada',
  'Mexico City, Mexico',
  'Seoul, South Korea'
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

  // Usa next/image per il caricamento ottimizzato. Impostiamo il layout tramite il contenitore padre e forniamo suggerimenti su width/height.
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
      onLoadingComplete={() => { /* no-op, mantiene il comportamento precedente */ }}
      onError={() => setImageError(true)}
      priority={false}
      // Consentire domini esterni in next.config (la configurazione images è già prevista)
    />
  );
};

export default function LiveDestinations({ searchQuery = '', continent, maxItems, variant = 'default', onLoading }: { 
  searchQuery?: string; 
  continent?: string;
  countryFilter?: string;
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

  // RNG con seed (mulberry32)
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
  // Se non viene fornito un seed, esegui uno shuffle Fisher-Yates casuale in modo che i risultati varino tra i caricamenti
    const a = arr.slice();
    if (!seed) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

  // Shuffle deterministico con seed (mulberry32) quando viene fornito un seed
    const rng = mulberry32(hashStringToInt(seed));
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const normalizeCountryKey = (raw: string) => {
    if (!raw) return '';
    let v = raw.toLowerCase().trim();
    // remove dots and extra whitespace
    v = v.replace(/\./g, '').replace(/\s+/g, ' ').trim();
    // map aliases (usa, uk, uae, etc.)
    if (COUNTRY_ALIASES[v]) return COUNTRY_ALIASES[v];
    return v;
  };

  useEffect(() => {
    // Precarica immagini per città più popolari per migliorare velocità
    const preloadPopularImages = () => {
      if (typeof window !== 'undefined') {
        const popularCities = ['New York', 'London', 'Paris', 'Tokyo', 'Rome'];
        popularCities.forEach((city, index) => {
          const img = document.createElement('img');
          img.src = getCityImage(city, index);
        });
      }
    };
    preloadPopularImages();

        const fetchDestinations = async () => {
      setLoading(true);
      onLoading?.(true);
      setError(null);

      try {
              // Filtra per continente se specificato (normalizza e supporta alias come "North America")
              const rawCont = continent ? String(continent).toLowerCase().trim() : null;
              const CONTINENT_ALIASES: Record<string,string> = {
                'north america': 'america',
                'south america': 'america',
                'americas': 'america',
                'oceania': 'oceania',
                'australia': 'oceania',
                'europe': 'europe',
                'asia': 'asia',
                'africa': 'africa',
              };
              const continentFilter = rawCont ? (CONTINENT_ALIASES[rawCont] || rawCont) : null;

        // Cache per le destinazioni complete per evitare ricerche ripetute
        const destinationsCache: Map<string, LiveDestination[]> = (globalThis as any).__GM_DESTINATIONS_CACHE || new Map();
        (globalThis as any).__GM_DESTINATIONS_CACHE = destinationsCache;

        // Crea una chiave cache basata sui parametri di ricerca
        const cacheKey = `${searchQuery || 'empty'}_${continentFilter || 'empty'}_${seedParam || 'empty'}_${maxItems || 12}`;
        
        // Controlla se abbiamo già i risultati in cache (validi per 5 minuti)
        const cached = destinationsCache.get(cacheKey);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          const cacheTimestamp = (cached as any).__timestamp || 0;
          const isRecentCache = Date.now() - cacheTimestamp < 5 * 60 * 1000; // 5 minuti
          
          if (isRecentCache) {
            setDestinations(cached);
            setLoading(false);
            onLoading?.(false);
            return;
          }
        }

        const citiesSource = (() => {
          // If no continent filter is provided, prefer showing a curated set of globally-known major cities
          if (!continentFilter) return MAJOR_GLOBAL_CITIES;
          // Usa il dataset completo per mappare i paesi: filtra POPULAR_CITIES estraendo il paese e verificando il continente
          return POPULAR_CITIES.filter(c => {
            const parts = c.split(',');
            const countryPart = parts[1] ? parts[1].trim() : '';
            const normalized = normalizeCountryKey(countryPart);
            const mapped = (countryToContinent as Record<string,string>)[normalized];
            // debug per-item mapping in dev
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.debug('[LiveDestinations] POPULAR_CITIES mapping', { raw: countryPart, normalized, mapped, continentFilter });
            }
            // If we couldn't map by the simple split, try a few fallback heuristics
            if (!mapped) {
              const rest = parts.slice(1).join(',').trim();
              const alt = normalizeCountryKey(rest);
              const mappedAlt = (countryToContinent as Record<string,string>)[alt];
              if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[LiveDestinations] POPULAR_CITIES alt mapping', { rest, alt, mappedAlt });
              }
              if (mappedAlt) {
                return mappedAlt === continentFilter;
              }
              return false;
            }
            return mapped === continentFilter;
          });
        })();

      // debug log to help diagnose filtering issues
      // eslint-disable-next-line no-console
      console.debug('LiveDestinations: continent=', continent, 'continentFilter=', continentFilter, 'citiesSource.length=', citiesSource.length);

        // If a continent is provided we want to use the continent-based source even if
        // the `searchQuery` equals the continent name (the footer links prefill the search
        // input for UX but the actual filtering should be continent-based).
        const isContinentSearch = continentFilter && searchQuery && searchQuery.trim().toLowerCase() === String(continentFilter).toLowerCase();
        const citiesToFetch = (searchQuery.trim() && !isContinentSearch)
          ? [searchQuery]
          : seededShuffle(citiesSource, seedParam).slice(0, maxItems || 12);

  // Cache in memoria con expiry per evitare ricerche ripetute (più persistente)
        const geocodeCache: Map<string, { data: any; timestamp: number }> = (globalThis as any).__GM_GEOCODE_CACHE || new Map();
        (globalThis as any).__GM_GEOCODE_CACHE = geocodeCache;

        const imageCache: Map<string, { url: string; timestamp: number }> = (globalThis as any).__GM_IMAGE_CACHE || new Map();
        (globalThis as any).__GM_IMAGE_CACHE = imageCache;

        // Cache timeout: 30 minuti per geocoding, 1 ora per immagini
        const GEOCODE_CACHE_TTL = 30 * 60 * 1000;
        const IMAGE_CACHE_TTL = 60 * 60 * 1000;

        // Caricamento progressivo senza batch: ogni destinazione appare appena pronta

        const fetchForCity = async (city: string, index: number) => {
          // geocoding con cache TTL
          const cachedGeocode = geocodeCache.get(city);
          let geocode: any;
          
          if (cachedGeocode && (Date.now() - cachedGeocode.timestamp) < GEOCODE_CACHE_TTL) {
            geocode = cachedGeocode.data;
          } else {
            try {
              // Richiedi geocoding senza timeout per permettere caricamento progressivo
              const response = await fetch(`/api/geocode?q=${encodeURIComponent(city)}&limit=1&lang=it`);
              geocode = await response.json();
              geocodeCache.set(city, { data: geocode, timestamp: Date.now() });
            } catch (err) {
              logger.warn(`Failed to fetch geocode for ${city}:`, err);
              return null;
            }
          }

          const suggestion = geocode?.suggestions?.[0];
          if (!suggestion) return null;

          // Suggestion.name è localizzato (es. "Roma, Italia") quando lang=it
          const cityName = (suggestion.name || '').split(',')[0].trim();
          // Preferisci un campo `country` esplicito se fornito dalla route di geocoding
          const country = suggestion.country || suggestion.name.split(',').slice(1).join(',').trim() || 'Unknown';
          const countryCode = suggestion.country_code || suggestion.properties?.country_code || '';

          // Se è stato richiesto un continente, verifica che il country rispetti il continente mappato
          if (continentFilter) {
            // Prova a normalizzare il campo country e mappare col dataset completo
            let mapped: string | undefined;
            // Preferisci il country_code ISO se fornito
            if (countryCode) {
              const code = String(countryCode).toLowerCase();
              const alias = COUNTRY_ALIASES[code];
              if (alias) mapped = (countryToContinent as Record<string,string>)[alias];
            }

            if (!mapped) {
              const countryLower = (country || '').toLowerCase();
              // Rimuovi articoli e punteggiatura comuni
              const normalized = countryLower.replace(/\./g, '').replace(/\s+/g, ' ').trim();
              const alias = COUNTRY_ALIASES[normalized];
              mapped = alias ? (countryToContinent as Record<string,string>)[alias] : (countryToContinent as Record<string,string>)[normalized] || (countryToContinent as Record<string,string>)[countryLower];
            }

            if (!mapped || mapped !== continentFilter) {
              // Scarta se il paese non corrisponde al continente richiesto
              if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[LiveDestinations] geocode filtered out', { city, cityName, country, countryCode, mapped, continentFilter });
              }
              return null;
            }
          }

          // country-specific filtering removed — continent select is authoritative, searchQuery can still be used for direct searches

          // immagine + descrizione localizzata con cache TTL
          const cachedImage = imageCache.get(cityName);
          let imageUrl: string;
          let apiDescription: string | null = null;
          
          if (cachedImage && (Date.now() - cachedImage.timestamp) < IMAGE_CACHE_TTL) {
            imageUrl = cachedImage.url;
          } else {
            // Usa fallback immediato e prova API in background
            imageUrl = getCityImage(cityName, index);
            
            try {
              // API immagini senza timeout per caricamento progressivo
              const imageResponse = await fetch(`/api/city-images?city=${encodeURIComponent(cityName)}`);
              
              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                if (imageData.imageUrl) {
                  imageUrl = imageData.imageUrl;
                } else if (imageData.fallbackUrl) {
                  imageUrl = imageData.fallbackUrl;
                }

                // Preferisci descrizione/titolo in Italiano quando fornito dall'API
                if (imageData.description) apiDescription = imageData.description;
                else if (imageData.longExtract) apiDescription = imageData.longExtract;
                else if (imageData.title && typeof imageData.title === 'string') {
                  apiDescription = String(imageData.title);
                }
              }
            } catch (imgError) {
              logger.warn(`Impossibile ottenere l'immagine per ${cityName}:`, imgError);
            }
            
            imageCache.set(cityName, { url: imageUrl, timestamp: Date.now() });
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
            // Preferisci la descrizione localizzata (italiano) quando disponibile dall'API city-images
            description: apiDescription || `Scopri ${cityName} con la sua cultura, attrazioni ed esperienze uniche.`
          } as LiveDestination;
        };

        // Caricamento progressivo: avvia tutte le richieste in parallelo e aggiorna UI man mano
        const processedIds = new Set<string>();
        const processedNames = new Set<string>();
        
        const isNearby = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const toRad = (v: number) => (v * Math.PI) / 180;
          const R = 6371; // km
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const d = R * c;
          return d <= 1.0; // entro 1 km
        };

        const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

        // Avvia tutte le richieste e processa risultati appena disponibili
        const allPromises = citiesToFetch.map(async (city, index) => {
          try {
            const destination = await fetchForCity(city, index);
            if (!destination) return;

            // Controllo duplicati in tempo reale
            if (processedIds.has(destination.id)) return;
            
            const normalizedName = normalize(destination.name || '');
            if (processedNames.has(normalizedName)) return;

            // Controlla prossimità con destinazioni già aggiunte
            let tooClose = false;
            setDestinations(currentDestinations => {
              for (const existing of currentDestinations) {
                if (destination.lat && destination.lon && existing.lat && existing.lon && 
                    isNearby(destination.lat, destination.lon, existing.lat, existing.lon)) {
                  tooClose = true;
                  break;
                }
              }
              
              if (!tooClose) {
                processedIds.add(destination.id);
                processedNames.add(normalizedName);
                return [...currentDestinations, destination];
              }
              return currentDestinations;
            });
          } catch (error) {
            logger.warn(`Error processing city ${city}:`, error);
          }
        });

        // Aspetta che tutte le richieste siano completate per segnalare fine caricamento
        await Promise.allSettled(allPromises);

        // Salva i risultati finali in cache solo se abbiamo destinazioni valide
        setTimeout(() => {
          setDestinations((currentDestinations) => {
            if (currentDestinations.length > 0) {
              const destinationsWithTimestamp = currentDestinations as any;
              destinationsWithTimestamp.__timestamp = Date.now();
              destinationsCache.set(cacheKey, destinationsWithTimestamp);
            }
            return currentDestinations;
          });
        }, 100);

      } catch (err) {
    setError('Impossibile caricare le destinazioni');
        logger.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
        onLoading?.(false);
      }
    };

  // resetta le destinazioni prima del fetch
    setDestinations([]);
    fetchDestinations();
  }, [searchQuery, seedParam, continent]);

  // Usa il nome della destinazione quando chiami add/remove così AppContext può risolvere all'id canonico del dataset
  const toggleFavorite = (destination: LiveDestination) => {
    const ident = destination.name || destination.id;
    if (isFavorite(ident)) {
      removeFromFavorites(ident);
    } else {
      addToFavorites(ident);
    }
  };

  if (loading) {
    // Skeleton grid mentre ricarica
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
          Errore durante il caricamento delle destinazioni
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
          Nessuna destinazione trovata
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Prova a cercare un'altra posizione
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
              
              {/* Pulsante Preferiti */}
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

              {/* Badge valutazione */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-black">{destination.rating}</span>
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
                    // Navigazione client-side verso i dettagli live — includi l'URL dell'immagine scelta così la pagina di dettaglio mostra la stessa foto
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
