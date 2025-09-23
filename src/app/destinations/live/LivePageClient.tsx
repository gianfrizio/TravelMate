"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useWeather } from '@/hooks/useWeather';
import { destinations } from '@/data/destinations';
import Button from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { Heart } from 'lucide-react';

export default function LivePageClient() {
  const params = useSearchParams();
  const name = params.get('name') || params.get('city') || '';
  const lat = params.get('lat') ? Number(params.get('lat')) : undefined;
  const lon = params.get('lon') ? Number(params.get('lon')) : undefined;

  const { weatherData, isLoading, error } = useWeather({ lat, lng: lon, location: name });
  const { addToFavorites, removeFromFavorites, isFavorite } = useApp();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [localInfo, setLocalInfo] = useState<any | null>(null);
  const [longExtract, setLongExtract] = useState<string | null>(null);
  const [apiDescription, setApiDescription] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  // ...existing code...
  useEffect(() => {
    // Try to find local destination data (case-insensitive match on name)
    const found = destinations.find(d => d.name.toLowerCase() === (name || '').toLowerCase());
    if (found) setLocalInfo(found);

    // Fetch image and description from our API
    const fetchImage = async () => {
      try {
        const params = new URLSearchParams({ city: name || '' });
        if (lat !== undefined) params.set('lat', String(lat));
        if (lon !== undefined) params.set('lon', String(lon));
        const resp = await fetch(`/api/city-images?${params.toString()}`);
        if (resp.ok) {
          const data = await resp.json();
          // If an explicit image param was provided in the URL (from the listing), prefer it
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

          // image fallback
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

    // Fetch place details from Geoapify if we have coordinates or name
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

  // Compute description and image src deterministically
  const primaryText = (longExtract && String(longExtract)) || apiDescription || localInfo?.description || '';
  const isExpandable = Boolean(primaryText && primaryText.length > 400);
  const displayedDescription = () => {
    if (!primaryText) return `Scopri ${name} — esplora attrazioni, cultura e punti di interesse locali.`;
    return isExpandable && !showMore ? `${primaryText.slice(0, 400)}...` : primaryText;
  };

  const imageSrc = imageUrl || localInfo?.image || (localInfo?.images && localInfo.images[0]) || `https://source.unsplash.com/800x600/?${encodeURIComponent((name ? name + ' skyline city panorama' : 'city skyline') )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{localInfo?.name || name || 'Live destination'}</h1>
          <div className="text-gray-600 mb-4">{localInfo?.country}</div>

          <div className="rounded-xl overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800 h-64 shadow-md border border-gray-100 dark:border-gray-700">
              <Image
                src={imageSrc}
                alt={name ?? 'city image'}
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                onError={(e) => {
                  // next/image does not expose the underlying HTMLImageElement directly; use a fallback by switching to a CDN URL
                  setImageUrl(`https://source.unsplash.com/800x600/?${encodeURIComponent(name || '')}`);
                }}
              />
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
                {/* Favorites action */}
              </div>
              <div>
                  <Button size="sm" className="px-2 py-1 text-sm flex items-center gap-2" onClick={() => {
                    // Resolve canonical id if we have local dataset
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
