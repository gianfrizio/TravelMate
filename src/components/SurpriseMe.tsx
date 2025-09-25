"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Star, Calendar, DollarSign, Shuffle, ArrowRight, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function SurpriseMe({ defaultCount = 3 }: { defaultCount?: number }) {
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState({
    continent: '',
    type: '',
    diversity: true
  });
  const router = useRouter();

  // Fetch delle immagini per le destinazioni
  const fetchImages = async (destinations: any[]) => {
    const imagePromises = destinations.map(async (dest) => {
      try {
        const response = await fetch(`/api/city-images?city=${encodeURIComponent(dest.name)}&country=${encodeURIComponent(dest.country || '')}`);
        if (response.ok) {
          const data = await response.json();
          return { id: dest.id, url: data.imageUrl };
        }
      } catch (error) {
        console.error(`Error fetching image for ${dest.name}:`, error);
      }
      return { id: dest.id, url: null };
    });

    const results = await Promise.all(imagePromises);
    const imageMap: Record<string, string> = {};
    results.forEach(({ id, url }) => {
      if (url) imageMap[id] = url;
    });
    setImages(prev => ({ ...prev, ...imageMap }));
  };

  // Destinazioni dinamiche categorizzate (stessa logica di LiveDestinations)
  const getDestinationsByFilters = (continent: string, type: string): string[] => {
    const destinationMap: Record<string, Record<string, string[]>> = {
      'Europe': {
        'city': ['Rome, Italy', 'Paris, France', 'Barcelona, Spain', 'Amsterdam, Netherlands', 'Prague, Czech Republic', 'Vienna, Austria', 'Budapest, Hungary', 'Berlin, Germany', 'London, UK', 'Madrid, Spain'],
        'beach': ['Santorini, Greece', 'Mykonos, Greece', 'Ibiza, Spain', 'Nice, France', 'Amalfi Coast, Italy', 'Dubrovnik, Croatia', 'Malta, Malta', 'Canary Islands, Spain', 'Algarve, Portugal', 'Costa del Sol, Spain'],
        'mountain': ['Zermatt, Switzerland', 'Chamonix, France', 'St. Moritz, Switzerland', 'Interlaken, Switzerland', 'Innsbruck, Austria', 'Dolomites, Italy', 'Scottish Highlands, UK', 'Bavarian Alps, Germany', 'High Tatras, Slovakia', 'Carpathians, Romania'],
        'nature': ['Iceland, Iceland', 'Plitvice Lakes, Croatia', 'Black Forest, Germany', 'Lake Bled, Slovenia', 'Azores, Portugal', 'Faroe Islands, Denmark', 'Norwegian Fjords, Norway', 'Lapland, Finland', 'Transylvania, Romania', 'Swiss National Park, Switzerland'],
        'culture': ['Florence, Italy', 'Venice, Italy', 'Athens, Greece', 'Istanbul, Turkey', 'Edinburgh, Scotland', 'Bruges, Belgium', 'Toledo, Spain', 'Krakow, Poland', 'Salzburg, Austria', 'Bath, UK'],
        'countryside': ['Tuscany, Italy', 'Provence, France', 'Cotswolds, UK', 'Douro Valley, Portugal', 'Loire Valley, France', 'Chianti, Italy', 'Umbria, Italy', 'Devon, UK', 'Burgundy, France', 'Andalusia, Spain']
      },
      'Asia': {
        'city': ['Tokyo, Japan', 'Bangkok, Thailand', 'Singapore, Singapore', 'Hong Kong, China', 'Seoul, South Korea', 'Dubai, UAE', 'Mumbai, India', 'Shanghai, China', 'Kuala Lumpur, Malaysia', 'Jakarta, Indonesia'],
        'beach': ['Maldives, Maldives', 'Bali, Indonesia', 'Phuket, Thailand', 'Langkawi, Malaysia', 'Boracay, Philippines', 'Jeju Island, South Korea', 'Goa, India', 'Hainan, China', 'Okinawa, Japan', 'Bintan, Indonesia'],
        'mountain': ['Everest Base Camp, Nepal', 'Mount Fuji, Japan', 'Kashmir, India', 'Leh, India', 'Hakone, Japan', 'Japanese Alps, Japan', 'Himalayas, Nepal', 'Kazbegi, Georgia', 'Tianshan Mountains, China', 'Altai Mountains, Mongolia'],
        'nature': ['Komodo Island, Indonesia', 'Borneo, Malaysia', 'Raja Ampat, Indonesia', 'Chitwan National Park, Nepal', 'Ranthambore, India', 'Sundarbans, Bangladesh', 'Gobi Desert, Mongolia', 'Kamchatka, Russia', 'Socotra Island, Yemen', 'Jeju Island, South Korea'],
        'culture': ['Kyoto, Japan', 'Angkor Wat, Cambodia', 'Varanasi, India', 'Petra, Jordan', 'Bagan, Myanmar', 'Luang Prabang, Laos', 'Bhaktapur, Nepal', 'Yogyakarta, Indonesia', 'Hoi An, Vietnam', 'Isfahan, Iran'],
        'countryside': ['Rice Terraces, Philippines', 'Tea Plantations, Sri Lanka', 'Kashmir Valley, India', 'Bagan Plains, Myanmar', 'Mekong Delta, Vietnam', 'Jiuzhaigou, China', 'Wuyuan, China', 'Shirakawa-go, Japan', 'Hobbiton, New Zealand', 'Cameron Highlands, Malaysia']
      },
      'America': {
        'city': ['New York, USA', 'San Francisco, USA', 'Mexico City, Mexico', 'Buenos Aires, Argentina', 'Rio de Janeiro, Brazil', 'Toronto, Canada', 'Chicago, USA', 'Los Angeles, USA', 'Montreal, Canada', 'Boston, USA'],
        'beach': ['Cancun, Mexico', 'Miami, USA', 'Hawaii, USA', 'Bahamas, Bahamas', 'Barbados, Barbados', 'Rio de Janeiro, Brazil', 'San Diego, USA', 'Cabo San Lucas, Mexico', 'Key West, USA', 'Aruba, Aruba'],
        'mountain': ['Banff, Canada', 'Aspen, USA', 'Patagonia, Argentina', 'Machu Picchu, Peru', 'Rocky Mountains, USA', 'Andes, Chile', 'Whistler, Canada', 'Jackson Hole, USA', 'Bariloche, Argentina', 'Torres del Paine, Chile'],
        'nature': ['Yellowstone, USA', 'Amazon Rainforest, Brazil', 'Galapagos Islands, Ecuador', 'Grand Canyon, USA', 'Yosemite, USA', 'Costa Rica, Costa Rica', 'Pantanal, Brazil', 'Iguazu Falls, Argentina', 'Denali, USA', 'Everglades, USA'],
        'culture': ['Cusco, Peru', 'Mexico City, Mexico', 'Quebec City, Canada', 'Cartagena, Colombia', 'Oaxaca, Mexico', 'Salvador, Brazil', 'Washington DC, USA', 'Boston, USA', 'Charleston, USA', 'Santa Fe, USA'],
        'countryside': ['Napa Valley, USA', 'Wine Country, Argentina', 'Coffee Triangle, Colombia', 'Vermont, USA', 'Prince Edward Island, Canada', 'Mendoza, Argentina', 'Central Valley, Chile', 'Finger Lakes, USA', 'Hudson Valley, USA', 'Serra Gaucha, Brazil']
      },
      'Africa': {
        'city': ['Cape Town, South Africa', 'Marrakech, Morocco', 'Cairo, Egypt', 'Casablanca, Morocco', 'Tunis, Tunisia', 'Addis Ababa, Ethiopia', 'Nairobi, Kenya', 'Lagos, Nigeria', 'Johannesburg, South Africa', 'Fez, Morocco'],
        'beach': ['Zanzibar, Tanzania', 'Seychelles, Seychelles', 'Mauritius, Mauritius', 'Sharm El Sheikh, Egypt', 'Essaouira, Morocco', 'Djerba, Tunisia', 'Durban, South Africa', 'Alexandria, Egypt', 'Agadir, Morocco', 'Mombasa, Kenya'],
        'mountain': ['Kilimanjaro, Tanzania', 'Atlas Mountains, Morocco', 'Table Mountain, South Africa', 'Mount Kenya, Kenya', 'Drakensberg, South Africa', 'Simien Mountains, Ethiopia', 'Rwenzori Mountains, Uganda', 'Hoggar Mountains, Algeria', 'Brandberg, Namibia', 'Fish River Canyon, Namibia'],
        'nature': ['Serengeti, Tanzania', 'Kruger National Park, South Africa', 'Masai Mara, Kenya', 'Okavango Delta, Botswana', 'Victoria Falls, Zambia', 'Sahara Desert, Morocco', 'Sossusvlei, Namibia', 'Madagascar, Madagascar', 'Chobe National Park, Botswana', 'Bwindi Forest, Uganda'],
        'culture': ['Luxor, Egypt', 'Fez, Morocco', 'Stone Town, Tanzania', 'Lalibela, Ethiopia', 'Timbuktu, Mali', 'Great Zimbabwe, Zimbabwe', 'Axum, Ethiopia', 'Kairouan, Tunisia', 'Djenne, Mali', 'Rock Churches, Ethiopia'],
        'countryside': ['Wine Lands, South Africa', 'Nile Valley, Egypt', 'Atlas Foothills, Morocco', 'Ethiopian Highlands, Ethiopia', 'Garden Route, South Africa', 'Karoo, South Africa', 'Stellenbosch, South Africa', 'Franschhoek, South Africa', 'Constantia, South Africa', 'Paarl, South Africa']
      },
      'Oceania': {
        'city': ['Sydney, Australia', 'Melbourne, Australia', 'Auckland, New Zealand', 'Brisbane, Australia', 'Perth, Australia', 'Wellington, New Zealand', 'Adelaide, Australia', 'Christchurch, New Zealand', 'Gold Coast, Australia', 'Cairns, Australia'],
        'beach': ['Gold Coast, Australia', 'Great Barrier Reef, Australia', 'Fiji, Fiji', 'Bora Bora, French Polynesia', 'Byron Bay, Australia', 'Whitsundays, Australia', 'Bay of Islands, New Zealand', 'Rottnest Island, Australia', 'Vanuatu, Vanuatu', 'New Caledonia, New Caledonia'],
        'mountain': ['Queenstown, New Zealand', 'Blue Mountains, Australia', 'Southern Alps, New Zealand', 'Grampians, Australia', 'Mount Cook, New Zealand', 'Cradle Mountain, Australia', 'Fiordland, New Zealand', 'Snowy Mountains, Australia', 'Flinders Ranges, Australia', 'Milford Sound, New Zealand'],
        'nature': ['Uluru, Australia', 'Kakadu, Australia', 'Rotorua, New Zealand', 'Kangaroo Island, Australia', 'Franz Josef Glacier, New Zealand', 'Daintree Rainforest, Australia', 'Abel Tasman, New Zealand', 'Tasmania Devils, Australia', 'Waitomo Caves, New Zealand', 'Ningaloo Reef, Australia'],
        'culture': ['Uluru, Australia', 'Rotorua, New Zealand', 'Alice Springs, Australia', 'Waitangi, New Zealand', 'Port Arthur, Australia', 'Bay of Islands, New Zealand', 'Sovereign Hill, Australia', 'Te Papa, New Zealand', 'Sydney Opera House, Australia', 'Maori Culture, New Zealand'],
        'countryside': ['Hunter Valley, Australia', 'Barossa Valley, Australia', 'Marlborough, New Zealand', 'Yarra Valley, Australia', 'Central Otago, New Zealand', 'Adelaide Hills, Australia', 'Hawke\'s Bay, New Zealand', 'Margaret River, Australia', 'Gisborne, New Zealand', 'Clare Valley, Australia']
      }
    };

    const continentData = destinationMap[continent];
    if (!continentData) return [];
    
    const typeData = continentData[type];
    if (!typeData) return [];
    
    return typeData;
  };

  const fetchRandom = async () => {
    setLoading(true);
    try {
      // Usa logica dinamica invece dell'API statica
      let possibleDestinations: string[] = [];
      
      if (preferences.continent && preferences.type) {
        // Filtro specifico continente + tipo
        possibleDestinations = getDestinationsByFilters(preferences.continent, preferences.type);
      } else if (preferences.continent) {
        // Solo continente - prendi da tutti i tipi
        const types = ['city', 'beach', 'mountain', 'nature', 'culture', 'countryside'];
        for (const type of types) {
          possibleDestinations.push(...getDestinationsByFilters(preferences.continent, type));
        }
      } else if (preferences.type) {
        // Solo tipo - prendi da tutti i continenti
        const continents = ['Europe', 'Asia', 'America', 'Africa', 'Oceania'];
        for (const continent of continents) {
          possibleDestinations.push(...getDestinationsByFilters(continent, preferences.type));
        }
      } else {
        // Nessun filtro - prendi da tutto
        const continents = ['Europe', 'Asia', 'America', 'Africa', 'Oceania'];
        const types = ['city', 'beach', 'mountain', 'nature', 'culture', 'countryside'];
        for (const continent of continents) {
          for (const type of types) {
            possibleDestinations.push(...getDestinationsByFilters(continent, type));
          }
        }
      }

      // Rimuovi duplicati e mescola
      possibleDestinations = [...new Set(possibleDestinations)];
      
      if (preferences.diversity) {
        // Logica di diversità: prendi da continenti diversi se possibile
        const shuffled = possibleDestinations.sort(() => Math.random() - 0.5);
        possibleDestinations = shuffled;
      } else {
        possibleDestinations = possibleDestinations.sort(() => Math.random() - 0.5);
      }

      // Prendi solo il numero richiesto
      const selected = possibleDestinations.slice(0, defaultCount);
      
      // Crea destinazioni con dati dinamici
      const destinations = await Promise.all(selected.map(async (destination, index) => {
        const [city, country] = destination.split(', ');
        
        // Determina il tipo basato sui filtri o inferiscilo dal nome
        let inferredType = preferences.type || 'city';
        if (!preferences.type) {
          // Inferisci il tipo dal nome della destinazione
          const name = destination.toLowerCase();
          if (name.includes('beach') || name.includes('coast') || name.includes('island') || 
              ['santorini', 'maldives', 'bali', 'hawaii', 'cancun', 'miami', 'ibiza'].some(beach => name.includes(beach))) {
            inferredType = 'beach';
          } else if (name.includes('mountain') || name.includes('alps') || name.includes('peak') ||
                     ['zermatt', 'chamonix', 'aspen', 'banff', 'kilimanjaro'].some(mountain => name.includes(mountain))) {
            inferredType = 'mountain';
          } else if (name.includes('park') || name.includes('forest') || name.includes('safari') ||
                     ['yellowstone', 'serengeti', 'amazon', 'kruger'].some(nature => name.includes(nature))) {
            inferredType = 'nature';
          } else if (name.includes('valley') || name.includes('vineyard') || name.includes('countryside') ||
                     ['tuscany', 'provence', 'napa', 'douro'].some(country => name.includes(country))) {
            inferredType = 'countryside';
          } else if (['rome', 'athens', 'florence', 'venice', 'paris', 'kyoto'].some(culture => name.includes(culture))) {
            inferredType = 'culture';
          }
        }

        return {
          id: `dynamic-${index}`,
          name: city,
          country: country || city,
          type: inferredType,
          rating: 4.0 + Math.random() * 1.0, // Rating casuale tra 4.0 e 5.0
          activities: [
            {
              id: `${index}-1`,
              name: `Esplora ${city}`,
              description: `Scopri le meraviglie di ${city}`,
              icon: inferredType === 'beach' ? '🏖️' : 
                    inferredType === 'mountain' ? '⛰️' : 
                    inferredType === 'nature' ? '🌿' : 
                    inferredType === 'culture' ? '🏛️' : 
                    inferredType === 'countryside' ? '🌾' : '🏙️',
              duration: '2-4 ore'
            }
          ]
        };
      }));

      setResults(destinations);
      
      // Fetch immagini per le nuove destinazioni
      if (destinations.length > 0) {
        fetchImages(destinations);
      }
    } catch (e) {
      console.error('Error fetching random destinations:', e);
    } finally {
      setLoading(false);
    }
  };



  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'city': return '🏙️';
      case 'nature': return '🌿';
      case 'culture': return '🏛️';
      case 'beach': return '🏖️';
      case 'mountain': return '⛰️';
      case 'countryside': return '🌾';
      default: return '🗺️';
    }
  };  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-10 relative overflow-hidden"
    >
      {/* Sfondo gradiente animato */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-teal-600/20 rounded-3xl blur-3xl" />
      
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30">
        {/* Header con animazione */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-purple-500" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Globe className="w-6 h-6 text-blue-500" />
              </motion.div>
            </div>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Non sai dove andare?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Lascia che ti consigli delle destinazioni incredibili basate sui tuoi gusti
          </p>
        </motion.div>

        {/* Filtri di preferenza */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl"
        >
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-purple-500" />
            Personalizza la tua sorpresa
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={preferences.continent}
              onChange={(e) => setPreferences(prev => ({ ...prev, continent: e.target.value }))}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">🌍 Tutti continenti</option>
              <option value="Europe">🌍 Europa</option>
              <option value="Asia">🌏 Asia</option>
              <option value="America">🌎 America</option>
              <option value="Africa">🌍 Africa</option>
              <option value="Oceania">🌍 Oceania</option>
            </select>

            <select
              value={preferences.type}
              onChange={(e) => setPreferences(prev => ({ ...prev, type: e.target.value }))}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">🗺️ Tutti i tipi</option>
              <option value="city">🏙️ Città</option>
              <option value="nature">🌿 Natura</option>
              <option value="culture">🏛️ Cultura</option>
              <option value="beach">🏖️ Mare</option>
                            <option value="mountain">⛰️ Montagna</option>
              <option value="countryside">🌾 Campagna</option>
            </select>

            <div className="flex items-center justify-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.diversity}
                  onChange={(e) => setPreferences(prev => ({ ...prev, diversity: e.target.checked }))}
                  className="w-5 h-5 text-purple-500 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Massima varietà
                </span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Pulsante sorprendimi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8"
        >
          <Button
            onClick={fetchRandom}
            size="lg"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
                Sto cercando...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                Sorprendimi!
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </motion.div>

        {/* Risultati */}
        <AnimatePresence mode="wait">
          {results && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
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
                  className="group cursor-pointer"
                  onClick={() => {
                    // Naviga alla destinazione o alla pagina di ricerca
                    router.push(`/destinations?search=${encodeURIComponent(result.name)}`);
                  }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    {/* Immagine */}
                    <div className="relative h-48 overflow-hidden">
                      {images[result.id] ? (
                        <motion.img
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.6 }}
                          src={images[result.id]}
                          alt={result.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-6xl opacity-80"
                          >
                            {getTypeIcon(result.type)}
                          </motion.div>
                        </div>
                      )}
                      
                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      
                      {/* Badge rating */}
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold">{result.rating?.toFixed(1) || 'N/A'}</span>
                      </div>


                    </div>

                    {/* Contenuto */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {result.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {result.country}
                          </p>
                        </div>
                        <div className="text-2xl">
                          {getTypeIcon(result.type)}
                        </div>
                      </div>

                      {/* Attività */}
                      {result.activities && result.activities.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attività principali:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.activities.slice(0, 3).map((activity: any, idx: number) => (
                              <motion.div
                                key={activity.id || idx}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs"
                              >
                                <span>{activity.icon}</span>
                                <span>{activity.name}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pulsante esplora */}
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700"
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Clicca per esplorare
                        </span>
                        <ArrowRight className="w-5 h-5 text-purple-500 group-hover:text-purple-600 transition-colors" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stato vuoto animato */}
        {!results && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block text-6xl mb-4"
            >
              ✈️
            </motion.div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Pronto per la tua prossima avventura?
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Clicca su "Sorprendimi!" per scoprire destinazioni incredibili
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
