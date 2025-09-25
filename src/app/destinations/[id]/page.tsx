'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Calendar, 
  Clock,
  Share2,
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Plus,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { useWeather } from '@/hooks/useWeather';
import { Destination } from '@/types';
import logger from '@/lib/logger';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DestinationDetailPage({ params }: PageProps) {
  const { state, addToFavorites, removeFromFavorites, isFavorite, addToItinerary } = useApp();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [itineraryDates, setItineraryDates] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });

  // Unwrap params usando React.use()
  const resolvedParams = use(params);

  // Trova la destinazione
  useEffect(() => {
    if (state.destinations && state.destinations.length > 0) {
      const foundDestination = state.destinations.find(d => d.id === resolvedParams.id);
      if (!foundDestination) {
        notFound();
      }
      setDestination(foundDestination);
    }
  }, [resolvedParams.id, state.destinations]);

  // Hook per il meteo
  const { weatherData, isLoading: weatherLoading, error: weatherError } = useWeather({
    lat: destination?.coordinates.lat,
    lng: destination?.coordinates.lng,
    location: destination?.name
  });

  if (!destination) {
    return <div>Caricamento...</div>;
  }

  const toggleFavorite = () => {
    if (isFavorite(destination.id)) {
      removeFromFavorites(destination.id);
    } else {
      addToFavorites(destination.id);
    }
  };

  const handleAddToItinerary = () => {
    if (itineraryDates.startDate && itineraryDates.endDate) {
      addToItinerary({
        destinationId: destination.id,
        startDate: itineraryDates.startDate,
        endDate: itineraryDates.endDate,
        notes: itineraryDates.notes
      });
      setShowItineraryModal(false);
      setItineraryDates({ startDate: '', endDate: '', notes: '' });
    }
  };

  const shareDestination = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${destination.name} - TravelMate`,
          text: destination.description,
          url: window.location.href,
        });
      } catch (err) {
      // Usa il logger invece di console.log diretto
        logger.warn('Errore condivisione:', err);
      }
    } else {
  // Fallback: copia URL negli appunti
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header con breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/destinations" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alle destinazioni
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section con immagini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96 lg:h-[500px]">
            {/* Immagine principale */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${destination.images[selectedImageIndex]}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Controlli immagine */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={toggleFavorite}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Heart 
                    className={`w-6 h-6 transition-colors ${
                      isFavorite(destination.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-600'
                    }`} 
                  />
                </button>
                <button
                  onClick={shareDestination}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Share2 className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Info overlay */}
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">{destination.name}</h1>
                <div className="flex items-center space-x-4 text-lg">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-5 h-5" />
                    <span>{destination.country}</span>
                  </div>

                </div>
              </div>
            </div>

            {/* Immagini thumbnail */}
            <div className="hidden lg:flex flex-col space-y-4">
              {destination.images.slice(1, 3).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index + 1)}
                  className={`relative h-full rounded-xl overflow-hidden ${
                    selectedImageIndex === index + 1 ? 'ring-4 ring-primary-500' : ''
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-300"
                    style={{ backgroundImage: `url('${image}')` }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail mobile */}
          <div className="lg:hidden flex space-x-2 mt-4 overflow-x-auto">
            {destination.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                  selectedImageIndex === index ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${image}')` }}
                />
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenuto principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descrizione */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Descrizione
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {destination.description}
              </p>
              
              <div className="flex items-center space-x-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Miglior periodo: {destination.bestTimeToVisit.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Durata consigliata: {destination.duration}</span>
                </div>
              </div>
            </motion.section>

            {/* Attività */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Attività e Attrazioni
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{activity.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {activity.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.duration}
                          </p>
                        </div>
                      </div>
                      {/* price removed from activities */}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {activity.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prezzo e azioni */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 sticky top-24"
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {/* Price removed - not displayed */}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  destination.budget === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  destination.budget === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  Budget {destination.budget === 'low' ? 'Economico' : 
                          destination.budget === 'medium' ? 'Medio' : 'Alto'}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setShowItineraryModal(true)}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Aggiungi all'Itinerario
                </Button>
                
                <Button
                  onClick={toggleFavorite}
                  variant={isFavorite(destination.id) ? "secondary" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite(destination.id) ? 'fill-current' : ''}`} />
                  {isFavorite(destination.id) ? 'Rimuovi dai Preferiti' : 'Aggiungi ai Preferiti'}
                </Button>
              </div>
            </motion.div>

            {/* Meteo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <Cloud className="w-5 h-5 mr-2" />
                Meteo Attuale
              </h3>
              
              {weatherLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              ) : weatherError ? (
                <p className="text-red-500">Errore nel caricamento dei dati meteo</p>
              ) : weatherData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{weatherData.icon}</span>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {weatherData.temperature}°C
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {weatherData.condition}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {weatherData.humidity}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {weatherData.windSpeed} km/h
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal Itinerario */}
      {showItineraryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Aggiungi all'Itinerario
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data di partenza
                </label>
                <input
                  type="date"
                  value={itineraryDates.startDate}
                  onChange={(e) => setItineraryDates(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data di ritorno
                </label>
                <input
                  type="date"
                  value={itineraryDates.endDate}
                  onChange={(e) => setItineraryDates(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note (opzionale)
                </label>
                <textarea
                  value={itineraryDates.notes}
                  onChange={(e) => setItineraryDates(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Aggiungi note sul viaggio..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowItineraryModal(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                onClick={handleAddToItinerary}
                disabled={!itineraryDates.startDate || !itineraryDates.endDate}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Aggiungi
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}