"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useWeather } from '@/hooks/useWeather';
import { destinations } from '@/data/destinations';
import Button from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { Heart, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LivePageClient() {
  const params = useSearchParams();
  const name = params.get('name') || params.get('city') || '';
  const lat = params.get('lat') ? Number(params.get('lat')) : undefined;
  const lon = params.get('lon') ? Number(params.get('lon')) : undefined;

  const { weatherData, isLoading, error } = useWeather({ lat, lng: lon, location: name });
  const { addToFavorites, removeFromFavorites, isFavorite, getLastSearch } = useApp();
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [localInfo, setLocalInfo] = useState<any | null>(null);
  const [longExtract, setLongExtract] = useState<string | null>(null);
  const [apiDescription, setApiDescription] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [imageTimeout, setImageTimeout] = useState<NodeJS.Timeout | null>(null);
        // Se un parametro immagine esplicito è presente nell'URL (dalla lista), preferiscilo.
  useEffect(() => {
  // Prova a trovare i dati della destinazione locale (confronto case-insensitive sul nome)
    const found = destinations.find(d => d.name.toLowerCase() === (name || '').toLowerCase());
    if (found) setLocalInfo(found);

  // Recupera immagine e descrizione dalla nostra API
    const fetchImage = async () => {
      try {
        const params = new URLSearchParams({ city: name || '' });
        if (lat !== undefined) params.set('lat', String(lat));
        if (lon !== undefined) params.set('lon', String(lon));
        const resp = await fetch(`/api/city-images?${params.toString()}`);
        if (resp.ok) {
          const data = await resp.json();
          // Fallback immagine.
        // Se un parametro immagine esplicito è presente nell'URL (dalla lista), preferiscilo
          const forcedImage = params.get('image') || new URLSearchParams(window.location.search).get('image');
          if (forcedImage) {
            setImageUrl(forcedImage);
          } else if (data.imageUrl) {
            setImageUrl(data.imageUrl);
          }
          if (data.longExtract) setLongExtract(data.longExtract);
          if (data.description) setApiDescription(data.description);
          if (data.activities && (!localInfo?.activities || localInfo.activities.length === 0)) {
            setLocalInfo((prev: any) => ({ ...(prev || {}), activities: data.activities }));
          }

          // Fallback immagine
          if (!data.imageUrl && !new URLSearchParams(window.location.search).get('image')) {
            const fallback = localInfo?.image || (localInfo?.images && localInfo.images[0]) || `https://source.unsplash.com/featured/?${encodeURIComponent(name || '')}`;
            setImageUrl(fallback);
          }
        } else {
          const fallback = localInfo?.image || (localInfo?.images && localInfo.images[0]) || `https://source.unsplash.com/featured/?${encodeURIComponent(name || '')}`;
          setImageUrl(fallback);
        }
      } catch (e) {
        const fallback = localInfo?.image || (localInfo?.images && localInfo.images[0]) || `https://source.unsplash.com/featured/?${encodeURIComponent(name || '')}`;
        setImageUrl(fallback);
      }
    };

    if (name) fetchImage();

  // Recupera i dettagli del luogo da Geoapify se sono disponibili coordinate o nome
    const fetchPlaceDetails = async () => {
      try {
        const params = new URLSearchParams();
        if (lat && lon) {
          params.set('lat', String(lat));
          params.set('lon', String(lon));
        } else if (name) {
          params.set('q', name);
        }

        const pdResp = await fetch(`/api/place-details?${params.toString()}`);
        if (pdResp.ok) {
          const pd = await pdResp.json();
          if (pd?.result) {
            setLocalInfo((prev: any) => ({ ...(prev || {}), place: pd.result }));
          }
        }
      } catch (e) {
        // ignore
      }
    };

    if (name || (lat && lon)) fetchPlaceDetails();
  }, [name, lat, lon]);

  // Calcola descrizione e src dell'immagine in modo deterministico
  const primaryText = (longExtract && String(longExtract)) || apiDescription || localInfo?.description || '';
  const isExpandable = Boolean(primaryText && primaryText.length > 400);
  const displayedDescription = () => {
    if (!primaryText) return `Scopri ${name} — esplora attrazioni, cultura e punti di interesse locali.`;
    return isExpandable && !showMore ? `${primaryText.slice(0, 400)}...` : primaryText;
  };

  const imageSrc = imageUrl || localInfo?.image || (localInfo?.images && localInfo.images[0]) || `https://source.unsplash.com/800x600/?${encodeURIComponent((name ? name + ' skyline city panorama' : 'city skyline') )}`;

  // reset image loaded state when source changes
  useEffect(() => {
    setIsImageLoaded(false);
    setImageError(false);
    
    // Clear existing timeout
    if (imageTimeout) {
      clearTimeout(imageTimeout);
    }
    
    // Set timeout to force loading after 5 seconds
    const timeout = setTimeout(() => {
      if (!isImageLoaded) {
        setIsImageLoaded(true);
      }
    }, 5000);
    
    setImageTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [imageSrc]);

  const handleBackToSearch = () => {
    // Prima prova con browser back navigation se possibile
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Controlla se possiamo usare la history del browser
      try {
        const currentUrl = window.location.href;
        const referrer = document.referrer;
        
        // Se siamo arrivati da una pagina destinations, usa back()
        if (referrer && (referrer.includes('/destinations') && !referrer.includes('/destinations/live'))) {
          window.history.go(-1);
          return;
        }
      } catch (e) {
        // Se non funziona, continua con il fallback
      }
    }
    
    // Fallback: naviga con i parametri salvati senza ricaricare
    const lastSearch = getLastSearch();
    if (lastSearch && (lastSearch.query || lastSearch.continent)) {
      const params = new URLSearchParams();
      if (lastSearch.query) {
        params.set('search', lastSearch.query);
      }
      if (lastSearch.continent) {
        params.set('continent', lastSearch.continent);
      }
      // Indica che stiamo tornando dalla live page
      params.set('from_live', '1');
      
      // Usa replace per non aggiungere alla history
      router.replace(`/destinations?${params.toString()}`);
    } else {
      router.replace('/destinations');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Pulsante torna alla ricerca */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBackToSearch}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 border-primary-200 hover:border-primary-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla ricerca
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{localInfo?.name || name || 'Live destination'}</h1>
          <div className="text-gray-600 mb-4">{localInfo?.country}</div>

          <div className="relative rounded-xl overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800 h-64 shadow-md border border-gray-100 dark:border-gray-700">
            {isImageLoaded && !imageError ? (
              <Image
                src={imageSrc}
                alt={name ?? 'city image'}
                className="w-full h-full object-cover transition-opacity duration-500"
                fill
                placeholder="empty"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 800px"
                onLoad={() => {
                  setIsImageLoaded(true);
                  setImageError(false);
                }}
                onError={() => {
                  setImageError(true);
                  // Se l'immagine fallisce, prova con un'altra fonte
                  const fallbackUrl = `https://images.unsplash.com/featured/?${encodeURIComponent(name || 'city')}`;
                  if (imageSrc !== fallbackUrl && !imageError) {
                    setImageUrl(fallbackUrl);
                    setIsImageLoaded(false);
                  }
                }}
                style={{ zIndex: 10 }}
              />
            ) : (
              <div className="absolute inset-0 z-50 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 animate-shimmer transform translate-x-[-100%]" 
                     style={{
                       animation: 'shimmer 2s infinite linear',
                       background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                     }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/30 dark:bg-gray-600/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-sm bg-white/50 dark:bg-gray-500/50 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {displayedDescription()}
          </p>
          {isExpandable && (
            <button className="text-primary-600 text-sm mb-6" onClick={() => setShowMore(s => !s)}>
              {showMore ? 'Mostra meno' : 'Mostra altro'}
            </button>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Attività consigliate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(localInfo?.activities || []).slice(0,4).map((a: any) => (
                <div key={a.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">{a.icon}</div>
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-sm text-gray-500">{a.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                {/* azione preferiti */}
              </div>
              <div>
                  <Button size="sm" className="px-2 py-1 text-sm flex items-center gap-2" onClick={() => {
                    // Risolvi l'id canonico se abbiamo un dataset locale
                    const resolvedId = localInfo?.id || (destinations.find(d => d.name.toLowerCase() === (name || '').toLowerCase())?.id) || name;
                    if (isFavorite(resolvedId)) {
                      removeFromFavorites(resolvedId);
                    } else {
                      addToFavorites(resolvedId);
                    }
                  }}>
                    {isFavorite(localInfo?.id || name) ? (
                      <>
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>In Preferiti</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        <span>Aggiungi ai preferiti</span>
                      </>
                    )}
                  </Button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-2">Meteo</h3>
            {isLoading && <div>Caricamento...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {weatherData && (
              <div>
                <div className="text-4xl">{weatherData.icon}</div>
                <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
                <div className="text-sm text-gray-500">{weatherData.condition}</div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
