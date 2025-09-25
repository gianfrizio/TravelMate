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

import React, { useState, useEffect, useMemo } from 'react';
import logger from '@/lib/logger';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Heart, 
  Loader2,
  ChevronLeft,
  ChevronRight
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
  type: 'city' | 'beach' | 'mountain' | 'countryside' | 'culture' | 'nature';
  description: string;
};

// Destinazioni categorizzate per tipo
const DESTINATIONS_BY_TYPE = {
  city: [
    'New York, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan', 'Berlin, Germany',
    'Rome, Italy', 'Milan, Italy', 'Barcelona, Spain', 'Amsterdam, Netherlands',
    'Prague, Czech Republic', 'Vienna, Austria', 'Budapest, Hungary', 'Sydney, Australia',
    'Singapore, Singapore', 'Hong Kong, China', 'Seoul, South Korea', 'Dubai, UAE'
  ],
  beach: [
    'Santorini, Greece', 'Denpasar, Indonesia', 'Male, Maldives', 'Cancún, Mexico', 'Miami, USA',
    'Nice, France', 'Antalya, Turkey', 'Phuket, Thailand', 'Gold Coast, Australia',
    'Nadi, Fiji', 'Ibiza, Spain', 'Mykonos, Greece', 'Bridgetown, Barbados', 'Victoria, Seychelles'
  ],
  mountain: [
    'Banff, Canada', 'Aspen, USA', 'Zermatt, Switzerland', 'Chamonix, France',
    'Interlaken, Switzerland', 'Queenstown, New Zealand', 'Innsbruck, Austria',
    'Whistler, Canada', 'St. Moritz, Switzerland', 'Davos, Switzerland'
  ],
  culture: [
    'Rome, Italy', 'Athens, Greece', 'Cairo, Egypt', 'Kyoto, Japan', 'Wadi Musa, Jordan',
    'Florence, Italy', 'Venice, Italy', 'Istanbul, Turkey', 'Marrakech, Morocco',
    'Jerusalem, Israel', 'Varanasi, India', 'Siem Reap, Cambodia'
  ],
  nature: [
    'Arusha, Tanzania', 'Manaus, Brazil', 'Jackson, USA', 'Fresno, USA',
    'Kruger National Park, South Africa', 'Puerto Ayora, Ecuador', 'Kota Kinabalu, Malaysia', 'Antananarivo, Madagascar',
    'San José, Costa Rica', 'Reykjavik, Iceland', 'Bariloche, Argentina'
  ],
  countryside: [
    'Florence, Italy', 'Avignon, France', 'Bath, UK', 'Tours, France',
    'Siena, Italy', 'Napa, USA', 'Porto, Portugal', 'Santorini, Greece'
  ]
};

const POPULAR_CITIES = [
  // EUROPA - Città culture
  'Rome, Italy', 'Florence, Italy', 'Venice, Italy', 'Siena, Italy', 'Assisi, Italy', 'Ravenna, Italy', 'Matera, Italy',
  'Paris, France', 'Versailles, France', 'Avignon, France', 'Arles, France', 'Carcassonne, France',
  'Madrid, Spain', 'Toledo, Spain', 'Seville, Spain', 'Granada, Spain', 'Cordoba, Spain', 'Santiago de Compostela, Spain',
  'Athens, Greece', 'Delphi, Greece', 'Meteora, Greece', 'Rhodes, Greece',
  'Prague, Czech Republic', 'Cesky Krumlov, Czech Republic', 'Vienna, Austria', 'Salzburg, Austria',
  'Budapest, Hungary', 'Krakow, Poland', 'Warsaw, Poland', 'Gdansk, Poland',
  'Amsterdam, Netherlands', 'Bruges, Belgium', 'Brussels, Belgium', 'Edinburgh, Scotland', 'Bath, UK',
  'Dublin, Ireland', 'Galway, Ireland', 'Stockholm, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway',
  'Istanbul, Turkey', 'Cappadocia, Turkey', 'Ephesus, Turkey',
  
  // EUROPA - Beach/Mare
  'Santorini, Greece', 'Mykonos, Greece', 'Crete, Greece', 'Ibiza, Spain', 'Mallorca, Spain', 'Costa del Sol, Spain',
  'Nice, France', 'Cannes, France', 'Saint-Tropez, France', 'Corsica, France',
  'Amalfi Coast, Italy', 'Cinque Terre, Italy', 'Capri, Italy', 'Sardinia, Italy', 'Sicily, Italy',
  'Dubrovnik, Croatia', 'Split, Croatia', 'Hvar, Croatia', 'Malta, Malta', 'Cyprus, Cyprus',
  'Algarve, Portugal', 'Madeira, Portugal', 'Canary Islands, Spain',
  
  // EUROPA - Montagna
  'Zermatt, Switzerland', 'Chamonix, France', 'St. Moritz, Switzerland', 'Interlaken, Switzerland',
  'Innsbruck, Austria', 'Hallstatt, Austria', 'Cortina d\'Ampezzo, Italy', 'Val Gardena, Italy',
  'Andorra la Vella, Andorra', 'Bansko, Bulgaria', 'Zakopane, Poland', 'High Tatras, Slovakia',
  'Bergen, Norway', 'Lofoten, Norway', 'Lapland, Finland', 'Scottish Highlands, UK',
  
  // EUROPA - Natura
  'Iceland, Iceland', 'Faroe Islands, Denmark', 'Plitvice Lakes, Croatia', 'Black Forest, Germany',
  'Azores, Portugal', 'Lake Bled, Slovenia', 'Dolomites, Italy', 'Bavarian Alps, Germany',
  
  // EUROPA - Campagna
  'Tuscany, Italy', 'Chianti, Italy', 'Val d\'Orcia, Italy', 'Umbria, Italy',
  'Provence, France', 'Loire Valley, France', 'Bordeaux, France', 'Burgundy, France',
  'Cotswolds, UK', 'Lake District, UK', 'Devon, UK', 'Cornwall, UK',
  'Douro Valley, Portugal', 'Alentejo, Portugal', 'Andalusia, Spain', 'Galicia, Spain',
  
  // ASIA - Città culture
  'Kyoto, Japan', 'Nara, Japan', 'Nikko, Japan', 'Kamakura, Japan', 'Hiroshima, Japan',
  'Beijing, China', 'Xi\'an, China', 'Shanghai, China', 'Guilin, China', 'Lijiang, China',
  'Seoul, South Korea', 'Gyeongju, South Korea', 'Busan, South Korea',
  'Bangkok, Thailand', 'Ayutthaya, Thailand', 'Chiang Mai, Thailand', 'Sukhothai, Thailand',
  'Siem Reap, Cambodia', 'Luang Prabang, Laos', 'Hanoi, Vietnam', 'Hue, Vietnam', 'Hoi An, Vietnam',
  'Kathmandu, Nepal', 'Bhaktapur, Nepal', 'Lhasa, Tibet', 'Thimphu, Bhutan',
  'Varanasi, India', 'Agra, India', 'Jaipur, India', 'Udaipur, India', 'Delhi, India', 'Mumbai, India',
  'Colombo, Sri Lanka', 'Kandy, Sri Lanka', 'Yogyakarta, Indonesia', 'Jakarta, Indonesia',
  'Bagan, Myanmar', 'Mandalay, Myanmar', 'Samarkand, Uzbekistan', 'Bukhara, Uzbekistan',
  'Isfahan, Iran', 'Shiraz, Iran', 'Petra, Jordan', 'Jerusalem, Israel', 'Damascus, Syria',
  
  // ASIA - Beach/Mare
  'Maldives, Maldives', 'Bali, Indonesia', 'Lombok, Indonesia', 'Phuket, Thailand', 'Koh Samui, Thailand',
  'Langkawi, Malaysia', 'Penang, Malaysia', 'Boracay, Philippines', 'Palawan, Philippines', 'Cebu, Philippines',
  'Jeju Island, South Korea', 'Okinawa, Japan', 'Goa, India', 'Kerala, India', 
  'Andaman Islands, India', 'Sri Lanka, Sri Lanka', 'Bintan, Indonesia', 'Batam, Indonesia',
  'Nha Trang, Vietnam', 'Da Nang, Vietnam', 'Phu Quoc, Vietnam', 'Hainan, China', 'Sanya, China',
  
  // ASIA - Montagna
  'Everest Base Camp, Nepal', 'Annapurna, Nepal', 'Pokhara, Nepal', 'Kashmir, India', 'Ladakh, India',
  'Leh, India', 'Shimla, India', 'Manali, India', 'Darjeeling, India', 'Gangtok, India',
  'Hakone, Japan', 'Mount Fuji, Japan', 'Japanese Alps, Japan', 'Changbai Mountains, China',
  'Tianshan Mountains, China', 'Altai Mountains, Mongolia', 'Kazbegi, Georgia', 'Svaneti, Georgia',
  
  // ASIA - Natura  
  'Himalaya, Nepal', 'Chitwan National Park, Nepal', 'Ranthambore, India', 'Kaziranga, India',
  'Sundarbans, Bangladesh', 'Komodo Island, Indonesia', 'Borneo, Malaysia', 'Sumatra, Indonesia',
  'Raja Ampat, Indonesia', 'Bunaken, Indonesia', 'Gobi Desert, Mongolia', 'Kamchatka, Russia',
  
  // AMERICA - Città culture
  'Mexico City, Mexico', 'Oaxaca, Mexico', 'Merida, Mexico', 'Puebla, Mexico', 'Guanajuato, Mexico',
  'Cusco, Peru', 'Lima, Peru', 'Arequipa, Peru', 'Quito, Ecuador', 'Cuenca, Ecuador',
  'Cartagena, Colombia', 'Villa de Leyva, Colombia', 'Bogota, Colombia', 'Medellin, Colombia',
  'Havana, Cuba', 'Trinidad, Cuba', 'Antigua, Guatemala', 'Granada, Nicaragua',
  'Washington DC, USA', 'Philadelphia, USA', 'Boston, USA', 'Charleston, USA', 'Savannah, USA',
  'New Orleans, USA', 'Santa Fe, USA', 'San Antonio, USA', 'Quebec City, Canada', 'Montreal, Canada',
  'Salvador, Brazil', 'Ouro Preto, Brazil', 'Paraty, Brazil', 'Buenos Aires, Argentina',
  'Cordoba, Argentina', 'Montevideo, Uruguay', 'La Paz, Bolivia', 'Sucre, Bolivia',
  
  // AMERICA - Beach/Mare  
  'Cancun, Mexico', 'Playa del Carmen, Mexico', 'Tulum, Mexico', 'Cozumel, Mexico',
  'Miami, USA', 'Key West, USA', 'Myrtle Beach, USA', 'Outer Banks, USA',
  'Hawaii, USA', 'Honolulu, USA', 'Maui, USA', 'Waikiki, USA',
  'Bahamas, Bahamas', 'Barbados, Barbados', 'Aruba, Aruba', 'Jamaica, Jamaica',
  'Puerto Rico, Puerto Rico', 'Rio de Janeiro, Brazil', 'Florianopolis, Brazil',
  'Cabo San Lucas, Mexico', 'Acapulco, Mexico', 'Puerto Vallarta, Mexico',
  'San Diego, USA', 'Santa Monica, USA', 'Malibu, USA',
  
  // AMERICA - Montagna
  'Banff, Canada', 'Jasper, Canada', 'Whistler, Canada', 'Aspen, USA', 'Vail, USA',
  'Jackson Hole, USA', 'Park City, USA', 'Lake Tahoe, USA', 'Yosemite, USA',
  'Glacier National Park, USA', 'Rocky Mountain National Park, USA', 'Grand Teton, USA',
  'Machu Picchu, Peru', 'Bariloche, Argentina', 'Mendoza, Argentina', 'Patagonia, Argentina',
  'Torres del Paine, Chile', 'Ushuaia, Argentina', 'El Calafate, Argentina',
  
  // AMERICA - Natura
  'Yellowstone, USA', 'Grand Canyon, USA', 'Bryce Canyon, USA', 'Zion, USA', 'Arches, USA',
  'Denali, USA', 'Everglades, USA', 'Redwood, USA', 'Sequoia, USA',
  'Amazon Rainforest, Brazil', 'Pantanal, Brazil', 'Iguazu Falls, Argentina',
  'Galapagos Islands, Ecuador', 'Costa Rica, Costa Rica', 'Manuel Antonio, Costa Rica',
  'Monteverde, Costa Rica', 'Tortuguero, Costa Rica', 'Belize Barrier Reef, Belize',
  'Tikal, Guatemala', 'Cenotes, Mexico',
  
  // AMERICA - Campagna
  'Napa Valley, USA', 'Sonoma, USA', 'Finger Lakes, USA', 'Hudson Valley, USA',
  'New England, USA', 'Vermont, USA', 'Hill Country, USA',
  'Mendoza Wine Region, Argentina', 'Colchagua Valley, Chile', 'Casablanca Valley, Chile',
  'Uruguay Wine Region, Uruguay', 'Serra Gaucha, Brazil', 'Coffee Triangle, Colombia',
  'Central Valley, Costa Rica',
  
  // AFRICA - Città culture  
  'Cairo, Egypt', 'Luxor, Egypt', 'Aswan, Egypt', 'Alexandria, Egypt',
  'Marrakech, Morocco', 'Fez, Morocco', 'Meknes, Morocco', 'Chefchaouen, Morocco',
  'Tunis, Tunisia', 'Kairouan, Tunisia', 'Sidi Bou Said, Tunisia',
  'Addis Ababa, Ethiopia', 'Lalibela, Ethiopia', 'Axum, Ethiopia',
  'Stone Town, Tanzania', 'Cape Town, South Africa', 'Johannesburg, South Africa',
  'Timbuktu, Mali', 'Djenne, Mali',
  
  // AFRICA - Beach/Mare
  'Zanzibar, Tanzania', 'Seychelles, Seychelles', 'Mauritius, Mauritius',
  'Durban, South Africa', 'Essaouira, Morocco', 'Sharm El Sheikh, Egypt',
  'Hurghada, Egypt', 'Djerba, Tunisia', 'Agadir, Morocco',
  
  // AFRICA - Montagna
  'Kilimanjaro, Tanzania', 'Mount Kenya, Kenya', 'Atlas Mountains, Morocco',
  'Table Mountain, South Africa', 'Drakensberg, South Africa',
  'Simien Mountains, Ethiopia', 'Rwenzori Mountains, Uganda',
  
  // AFRICA - Natura
  'Serengeti, Tanzania', 'Ngorongoro Crater, Tanzania', 'Masai Mara, Kenya',
  'Amboseli, Kenya', 'Kruger National Park, South Africa', 'Chobe, Botswana',
  'Okavango Delta, Botswana', 'Victoria Falls, Zambia', 'Sahara Desert, Morocco',
  'Sossusvlei, Namibia', 'Fish River Canyon, Namibia', 'Madagascar, Madagascar',
  
  // AFRICA - Campagna
  'Wine Lands, South Africa', 'Stellenbosch, South Africa', 'Franschhoek, South Africa',
  'Garden Route, South Africa', 'Karoo, South Africa', 'Atlas Foothills, Morocco',
  'Nile Valley, Egypt', 'Ethiopian Highlands, Ethiopia',
  
  // OCEANIA - Città culture
  'Sydney, Australia', 'Melbourne, Australia', 'Adelaide, Australia', 'Perth, Australia',
  'Auckland, New Zealand', 'Wellington, New Zealand', 'Christchurch, New Zealand',
  'Dunedin, New Zealand',
  
  // OCEANIA - Beach/Mare  
  'Gold Coast, Australia', 'Sunshine Coast, Australia', 'Byron Bay, Australia',
  'Cairns, Australia', 'Whitsundays, Australia', 'Fraser Island, Australia',
  'Rottnest Island, Australia', 'Broome, Australia', 'Fiji, Fiji', 'Tahiti, French Polynesia',
  'Vanuatu, Vanuatu', 'New Caledonia, France', 'Cook Islands, Cook Islands',
  
  // OCEANIA - Montagna
  'Blue Mountains, Australia', 'Snowy Mountains, Australia', 'Cradle Mountain, Australia',
  'Mount Cook, New Zealand', 'Queenstown, New Zealand', 'Wanaka, New Zealand',
  'Fiordland, New Zealand', 'Arthur\'s Pass, New Zealand',
  
  // OCEANIA - Natura
  'Great Barrier Reef, Australia', 'Uluru, Australia', 'Kakadu, Australia',
  'Kangaroo Island, Australia', 'Tasmania, Australia', 'Milford Sound, New Zealand',
  'Bay of Islands, New Zealand', 'Abel Tasman, New Zealand', 'Franz Josef Glacier, New Zealand',
  
  // OCEANIA - Campagna
  'Hunter Valley, Australia', 'Barossa Valley, Australia', 'Yarra Valley, Australia',
  'Margaret River, Australia', 'Swan Valley, Australia', 'Central Otago, New Zealand',
  'Marlborough, New Zealand', 'Hawkes Bay, New Zealand'
];

// Città prioritarie per continente - quelle che devono apparire per prime
const PRIORITY_CITIES_BY_CONTINENT = {
  'Europe': [
    // Top cities per ogni tipo
    'Rome, Italy', 'Paris, France', 'London, UK', 'Barcelona, Spain', 'Amsterdam, Netherlands',
    'Prague, Czech Republic', 'Vienna, Austria', 'Florence, Italy', 'Venice, Italy', 'Athens, Greece',
    'Santorini, Greece', 'Nice, France', 'Amalfi, Italy', 'Capri, Italy', 'Malta',
    'Zermatt, Switzerland', 'Chamonix, France', 'Interlaken, Switzerland', 'Innsbruck, Austria',
    'Iceland', 'Norway Fjords', 'Lofoten Islands, Norway', 'Tuscany, Italy', 'Provence, France',
    'Douro Valley, Portugal', 'Loire Valley, France', 'Cotswolds, UK'
  ],
  'Asia': [
    'Tokyo, Japan', 'Kyoto, Japan', 'Seoul, South Korea', 'Beijing, China', 'Singapore, Singapore',
    'Hong Kong, Hong Kong', 'Bangkok, Thailand', 'Dubai, UAE', 'Istanbul, Turkey',
    'Bali, Indonesia', 'Maldive', 'Phuket, Thailand', 'Koh Samui, Thailand', 'Langkawi, Malaysia',
    'Banff, Canada', 'Himalaya, Nepal', 'Everest Base Camp, Nepal', 'Kashmir, India', 'Ladakh, India',
    'Serengeti, Tanzania', 'Amazon Rainforest, Brazil', 'Borneo, Malaysia', 'Raja Ampat, Indonesia',
    'Rice Terraces, Philippines', 'Sapa, Vietnam', 'Guilin, China', 'Kerala Backwaters, India'
  ],
  'America': [
    'New York, USA', 'Los Angeles, USA', 'San Francisco, USA', 'Chicago, USA', 'Miami, USA',
    'Rio de Janeiro, Brazil', 'Buenos Aires, Argentina', 'Mexico City, Mexico', 'Toronto, Canada',
    'Cancun, Mexico', 'Hawaii, USA', 'Key West, USA', 'Bahamas', 'Jamaica', 'Costa Rica',
    'Yellowstone, USA', 'Yosemite, USA', 'Grand Canyon, USA', 'Aspen, USA', 'Banff, Canada',
    'Amazon Rainforest, Brazil', 'Patagonia, Argentina', 'Galapagos Islands, Ecuador',
    'Napa Valley, USA', 'Mendoza, Argentina', 'Douro Valley, Portugal'
  ],
  'Africa': [
    'Cape Town, South Africa', 'Cairo, Egypt', 'Marrakech, Morocco', 'Nairobi, Kenya',
    'Lagos, Nigeria', 'Casablanca, Morocco', 'Johannesburg, South Africa',
    'Zanzibar, Tanzania', 'Seychelles', 'Mauritius', 'Sharm El Sheikh, Egypt',
    'Serengeti, Tanzania', 'Kruger National Park, South Africa', 'Victoria Falls, Zambia',
    'Sahara Desert, Morocco', 'Okavango Delta, Botswana', 'Madagascar',
    'Wine Lands, South Africa', 'Atlas Mountains, Morocco', 'Ethiopian Highlands, Ethiopia'
  ],
  'Oceania': [
    'Sydney, Australia', 'Melbourne, Australia', 'Auckland, New Zealand', 'Perth, Australia',
    'Brisbane, Australia', 'Wellington, New Zealand', 'Adelaide, Australia',
    'Gold Coast, Australia', 'Cairns, Australia', 'Byron Bay, Australia', 'Fiji', 'Tahiti',
    'Queenstown, New Zealand', 'Blue Mountains, Australia', 'Milford Sound, New Zealand',
    'Great Barrier Reef, Australia', 'Uluru, Australia', 'Kakadu, Australia',
    'Hunter Valley, Australia', 'Barossa Valley, Australia', 'Central Otago, New Zealand'
  ]
};

// When the UI requests 'all continents' show a curated list of globally-known major cities with good type distribution
const MAJOR_GLOBAL_CITIES = [
  // Culture cities
  'Rome, Italy', 'Florence, Italy', 'Paris, France', 'Athens, Greece', 'Prague, Czech Republic',
  'Kyoto, Japan', 'Beijing, China', 'Istanbul, Turkey', 'Cairo, Egypt', 'Marrakech, Morocco',
  'Cusco, Peru', 'Mexico City, Mexico', 'Washington DC, USA', 'Edinburgh, UK',
  
  // Modern cities  
  'New York, USA', 'London, UK', 'Tokyo, Japan', 'Dubai, UAE', 'Singapore, Singapore',
  'Hong Kong, Hong Kong', 'Sydney, Australia', 'Los Angeles, USA', 'Toronto, Canada',
  'Seoul, South Korea', 'Moscow, Russia', 'Buenos Aires, Argentina',
  
  // Beach destinations
  'Santorini, Greece', 'Bali, Indonesia', 'Maldives, Maldives', 'Cancun, Mexico',
  'Miami, USA', 'Nice, France', 'Phuket, Thailand', 'Rio de Janeiro, Brazil',
  'Gold Coast, Australia', 'Cape Town, South Africa',
  
  // Mountain destinations
  'Zermatt, Switzerland', 'Banff, Canada', 'Aspen, USA', 'Queenstown, New Zealand',
  'Chamonix, France', 'Innsbruck, Austria',
  
  // Nature destinations
  'Yellowstone, USA', 'Serengeti, Tanzania', 'Great Barrier Reef, Australia',
  'Amazon Rainforest, Brazil', 'Iceland, Iceland', 'Kruger National Park, South Africa',
  
  // Countryside destinations
  'Tuscany, Italy', 'Provence, France', 'Napa Valley, USA', 'Cotswolds, UK',
  'Douro Valley, Portugal', 'Loire Valley, France'
];

// Funzione per generare URL immagini affidabili
const getCityImage = (cityName: string, index: number): string => {
  const cityImages: Record<string, string> = {
    // Città principali
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
    'Berlin': 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&h=600&fit=crop',
    'Lisbon': 'https://images.unsplash.com/photo-1588959594747-be64cd73874a?w=800&h=600&fit=crop',
    'Madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
    'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop',
    'Budapest': 'https://images.unsplash.com/photo-1518952071651-e4b9b5c93c6a?w=800&h=600&fit=crop',
    'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21530d92b9bb?w=800&h=600&fit=crop',
    'Moscow': 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&h=600&fit=crop',
    'Beijing': 'https://images.unsplash.com/photo-1523804015925-3d2d76f8077b?w=800&h=600&fit=crop',
    'Seoul': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
    'Hong Kong': 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&h=600&fit=crop',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop',
    'Sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'Melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop',
    'Cairo': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73d0e?w=800&h=600&fit=crop',
    'Cape Town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop',
    'Rio de Janeiro': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
    'Buenos Aires': 'https://images.unsplash.com/photo-1589909202802-8a17d0d237e5?w=800&h=600&fit=crop',
    'Mexico City': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    
    // Destinazioni mare/beach
    'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
    'Mykonos': 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop',
    'Ibiza': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    'Mallorca': 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=800&h=600&fit=crop',
    'Nice': 'https://images.unsplash.com/photo-1572252821143-035ad3cdf51d?w=800&h=600&fit=crop',
    'Cannes': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    'Amalfi': 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&h=600&fit=crop',
    'Capri': 'https://images.unsplash.com/photo-1548346968-671d5ac72ece?w=800&h=600&fit=crop',
    'Malta': 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&h=600&fit=crop',
    'Maldive': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
    'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
    'Phuket': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'Koh Samui': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
    'Boracay': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    'Cancun': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    'Miami': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'Hawaii': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    'Gold Coast': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'Zanzibar': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    
    // Destinazioni montagna
    'Zermatt': 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop',
    'Chamonix': 'https://images.unsplash.com/photo-1551524164-d4b1ab68c05d?w=800&h=600&fit=crop',
    'St. Moritz': 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop',
    'Interlaken': 'https://images.unsplash.com/photo-1527004760525-a4c7b4f6b3e8?w=800&h=600&fit=crop',
    'Innsbruck': 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop',
    'Salzburg': 'https://images.unsplash.com/photo-1527004760525-a4c7b4f6b3e8?w=800&h=600&fit=crop',
    'Banff': 'https://images.unsplash.com/photo-1527004760525-a4c7b4f6b3e8?w=800&h=600&fit=crop',
    'Aspen': 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop',
    'Whistler': 'https://images.unsplash.com/photo-1527004760525-a4c7b4f6b3e8?w=800&h=600&fit=crop',
    'Queenstown': 'https://images.unsplash.com/photo-1527004760525-a4c7b4f6b3e8?w=800&h=600&fit=crop',
    'Bariloche': 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop',
    'Cusco': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop',
    
    // Destinazioni natura
    'Yellowstone': 'https://images.unsplash.com/photo-1544737151-6e4b13d5e5a4?w=800&h=600&fit=crop',
    'Yosemite': 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&h=600&fit=crop',
    'Grand Canyon': 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&h=600&fit=crop',
    'Serengeti': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop',
    'Kruger': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop',
    'Amazon': 'https://images.unsplash.com/photo-1544737151-6e4b13d5e5a4?w=800&h=600&fit=crop',
    'Great Barrier Reef': 'https://images.unsplash.com/photo-1544737151-6e4b13d5e5a4?w=800&h=600&fit=crop',
    'Galapagos': 'https://images.unsplash.com/photo-1544737151-6e4b13d5e5a4?w=800&h=600&fit=crop',
    'Iceland': 'https://images.unsplash.com/photo-1544737151-6e4b13d5e5a4?w=800&h=600&fit=crop',
    'Patagonia': 'https://images.unsplash.com/photo-1544737151-6e4b13d5e5a4?w=800&h=600&fit=crop',
    
    // Destinazioni campagna/countryside
    'Tuscany': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
    'Toscana': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
    'Provence': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'Loire Valley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'Napa Valley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'Douro Valley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'Cotswolds': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'Hunter Valley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'Barossa Valley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    'Mendoza': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop'
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
  
  // Cerca per parole chiave parziali
  const partialMatch = Object.keys(cityImages).find(key => {
    const keyWords = key.toLowerCase().split(/\s+/);
    const cityWords = normalizedCityName.split(/\s+/);
    return keyWords.some(keyWord => 
      cityWords.some(cityWord => 
        cityWord.includes(keyWord) || keyWord.includes(cityWord)
      )
    );
  });
  
  if (partialMatch) {
    return cityImages[partialMatch];
  }
  
  // Fallback con immagini tematiche basate sul tipo di destinazione rilevato
  const cityLower = normalizedCityName;
  
  // Genera immagini tematiche per tipo
  if (cityLower.includes('beach') || cityLower.includes('coast') || cityLower.includes('island') ||
      ['santorini', 'mykonos', 'bali', 'maldive', 'ibiza', 'mallorca', 'hawaii', 'cancun', 'miami'].some(beach => cityLower.includes(beach))) {
    const beaches = [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ];
    return beaches[Math.abs(cityName.charCodeAt(0)) % beaches.length];
  }
  
  if (cityLower.includes('mountain') || cityLower.includes('ski') || cityLower.includes('alps') ||
      ['zermatt', 'chamonix', 'aspen', 'banff', 'interlaken'].some(mountain => cityLower.includes(mountain))) {
    const mountains = [
      'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1527004760525-a4c7b4f6b3e8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551524164-d4b1ab68c05d?w=800&h=600&fit=crop'
    ];
    return mountains[Math.abs(cityName.charCodeAt(0)) % mountains.length];
  }
  
  if (['rome', 'athens', 'florence', 'venice', 'paris', 'prague', 'vienna'].some(culture => cityLower.includes(culture))) {
    const cultures = [
      'https://images.unsplash.com/photo-1552832230-c0197040d963?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552831388-6a0b3575b32a?w=800&h=600&fit=crop'
    ];
    return cultures[Math.abs(cityName.charCodeAt(0)) % cultures.length];
  }
  
  if (cityLower.includes('valley') || cityLower.includes('vineyard') || cityLower.includes('countryside') ||
      ['tuscany', 'toscana', 'provence', 'napa', 'douro'].some(country => cityLower.includes(country))) {
    const countryside = [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ];
    return countryside[Math.abs(cityName.charCodeAt(0)) % countryside.length];
  }
  
  if (cityLower.includes('park') || cityLower.includes('forest') || cityLower.includes('safari') ||
      ['yellowstone', 'yosemite', 'serengeti', 'amazon', 'kruger'].some(nature => cityLower.includes(nature))) {
    const nature = [
      'https://images.unsplash.com/photo-1544737151-6e4b13d5e5a4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop'
    ];
    return nature[Math.abs(cityName.charCodeAt(0)) % nature.length];
  }
  
  // Fallback finale con Picsum Photos (immagini di paesaggi)
  const imageId = 100 + (index * 50) + (cityName.length * 3);
  return `https://picsum.photos/800/600?random=${imageId}`;
};

// Componente per gestire il caricamento delle immagini con fallback
const CityImage = React.memo(({ src, alt, cityName }: { src: string; alt: string; cityName: string }) => {
  const [imageError, setImageError] = useState(false);

  // Controlli di sicurezza per i props
  if (!src || !alt || !cityName) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center">
        <div className="text-white text-4xl font-bold opacity-80">
          ?
        </div>
      </div>
    );
  }

  // Usa next/image per il caricamento ottimizzato. Impostiamo il layout tramite il contenitore padre e forniamo suggerimenti su width/height.
  if (imageError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-6xl font-bold opacity-80">
          {cityName[0]?.toUpperCase() || '?'}
        </div>
      </div>
    );
  }

  // Verifica che src sia un URL valido e compatibile con Next.js Image
  let validSrc = '';
  
  // Controlli rigorosi per src
  if (!src || typeof src !== 'string' || src.trim() === '' || src.length < 10) {
    // Genera un fallback deterministico
    const hash = Math.abs((cityName || 'fallback').split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0));
    validSrc = `https://picsum.photos/800/600?random=${hash}`;
  } else {
    try {
      const url = new URL(src.trim());
      
      // Verifica che sia HTTP/HTTPS
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      
      // Verifica che l'host non sia vuoto
      if (!url.hostname || url.hostname.length < 3) {
        throw new Error('Invalid hostname');
      }
      
      // Lista bianca di domini conosciuti per sicurezza
      const allowedDomains = [
        'images.unsplash.com',
        'picsum.photos',
        'via.placeholder.com',
        'placehold.it',
        'placeholder.com'
      ];
      
      const isAllowedDomain = allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
      
      if (isAllowedDomain) {
        validSrc = src.trim();
      } else {
        // Dominio non riconosciuto, usa fallback
        throw new Error('Domain not allowed');
      }
    } catch (error) {
      console.warn('Invalid src URL:', src, error);
      // Genera un fallback deterministico
      const hash = Math.abs((cityName || 'fallback').split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0));
      validSrc = `https://picsum.photos/800/600?random=${hash}`;
    }
  }

  // Controllo finale di sicurezza
  if (!validSrc || validSrc.length < 10) {
    validSrc = 'https://picsum.photos/800/600?random=1';
  }

  // Usa un try-catch per prevenire errori di rendering
  try {
    return (
      <Image
        src={validSrc}
        alt={alt || `Immagine di ${cityName || 'destinazione'}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        onLoadingComplete={() => { /* no-op, mantiene il comportamento precedente */ }}
        onError={() => setImageError(true)}
        priority={false}
        // Consentire domini esterni in next.config (la configurazione images è già prevista)
      />
    );
  } catch (error) {
    console.warn('Errore nel rendering di Image:', error, { validSrc, alt, cityName });
    // Fallback in caso di errore di rendering
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center">
        <div className="text-white text-4xl font-bold opacity-80">
          {cityName?.[0]?.toUpperCase() || '!'}
        </div>
      </div>
    );
  }
});

export default function LiveDestinations({ searchQuery = '', continent, type, maxItems, variant = 'default', onLoading }: { 
  searchQuery?: string; 
  continent?: string;
  type?: string;
  countryFilter?: string;
  maxItems?: number; 
  variant?: 'default' | 'hero',
  onLoading?: (loading: boolean) => void
}) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useApp();
  const router = useRouter();
  const [allDestinations, setAllDestinations] = useState<LiveDestination[]>([]); // Tutte le destinazioni caricate
  const [destinations, setDestinations] = useState<LiveDestination[]>([]); // Destinazioni filtrate da mostrare
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stati per la paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Mostra 12 destinazioni per pagina
  const [lastFiltersKey, setLastFiltersKey] = useState('');
  const searchParams = useSearchParams();
  const seedParam = searchParams?.get('seed') || undefined;
  
  // Recupera i filtri dalla URL per il reset della paginazione
  const urlContinent = searchParams?.get('continent');
  const urlType = searchParams?.get('type');

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
    // Debug: verifica che i parametri arrivino correttamente
    console.log('🔄 LiveDestinations useEffect triggered with:', {
      searchQuery,
      continent,
      type,
      seedParam
    });
    
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
            setAllDestinations(cached);
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
      console.debug('LiveDestinations: continent=', continent, 'continentFilter=', continentFilter, 'type=', type, 'citiesSource.length=', citiesSource.length, 'citiesSource=', citiesSource.slice(0, 5));

        // If a continent is provided we want to use the continent-based source even if
        // the `searchQuery` equals the continent name (the footer links prefill the search
        // input for UX but the actual filtering should be continent-based).
        const isContinentSearch = continentFilter && searchQuery && searchQuery.trim().toLowerCase() === String(continentFilter).toLowerCase();
        
        let citiesToFetch: string[];
        
        if (searchQuery.trim() && !isContinentSearch) {
          citiesToFetch = [searchQuery];
        } else {
          // Prima filtra per mostrare solo città vere (non regioni)
          const isActualCity = (cityString: string): boolean => {
            const cityName = cityString.split(',')[0].trim().toLowerCase();
            
            // Escludi regioni e aree geografiche note
            const excludedRegions = [
              'tuscany', 'toscana', 'chianti', 'val d\'orcia', 'umbria', 'provence', 'luberon',
              'loire valley', 'bordeaux', 'burgundy', 'champagne', 'alsace', 'normandy', 'brittany',
              'cotswolds', 'lake district', 'yorkshire dales', 'devon', 'cornwall', 'peak district',
              'scottish highlands', 'hebrides', 'orkney', 'shetland', 'black forest', 'rhine valley',
              'bavarian alps', 'dolomites', 'costa del sol', 'costa brava', 'amalfi coast', 'cinque terre',
              'algarve', 'canary islands', 'balearic islands', 'sardinia', 'sicily', 'corsica',
              'azores', 'madeira', 'faroe islands', 'lofoten', 'lapland', 'high tatras', 'carpathians',
              'plitvice lakes', 'cappadocia', 'rice terraces', 'great barrier reef', 'serengeti',
              'kruger', 'sahara', 'amazon', 'patagonia', 'yellowstone', 'yosemite', 'grand canyon',
              'napa valley', 'sonoma', 'hunter valley', 'barossa valley', 'douro valley', 'mendoza'
            ];
            
            return !excludedRegions.some(region => cityName.includes(region));
          };
          
          // Filtra solo le città vere
          const actualCities = citiesSource.filter(isActualCity);
          
          // Logica di prioritizzazione per continente - carica tutte le destinazioni ma con approccio progressivo
          const totalItems = maxItems || 120;
          
          if (continentFilter && PRIORITY_CITIES_BY_CONTINENT[continentFilter as keyof typeof PRIORITY_CITIES_BY_CONTINENT]) {
            // Per un continente specifico, usa prima le città prioritarie che sono anche città vere
            const priorityCities = PRIORITY_CITIES_BY_CONTINENT[continentFilter as keyof typeof PRIORITY_CITIES_BY_CONTINENT]
              .filter(isActualCity)
              .filter(city => actualCities.includes(city)); // Solo quelle disponibili in actualCities
            
            const otherCities = actualCities.filter(city => !priorityCities.includes(city));
            
            // Prendi prima le città prioritarie (circa 80% del totale)
            const priorityCount = Math.min(Math.ceil(totalItems * 0.8), priorityCities.length);
            const remainingSlots = totalItems - priorityCount;
            
            const selectedPriority = priorityCities.slice(0, priorityCount);
            const selectedOthers = seedParam 
              ? seededShuffle(otherCities, seedParam).slice(0, remainingSlots)
              : otherCities.slice(0, remainingSlots);
            
            citiesToFetch = [...selectedPriority, ...selectedOthers];
            
            console.log(`�️ Continent ${continentFilter}: ${selectedPriority.length} priority cities + ${selectedOthers.length} other cities = ${citiesToFetch.length} total`);
            console.log('Priority cities:', selectedPriority.slice(0, 3));
          } else {
            // Per "tutti i continenti", usa solo città vere
            citiesToFetch = seedParam 
              ? seededShuffle(actualCities, seedParam).slice(0, totalItems)
              : actualCities.slice(0, totalItems);
            
            console.log(`🌍 All continents: ${citiesToFetch.length} cities selected from ${actualCities.length} total`);
          }
        }

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
          // Debug: verifica che il parametro type sia disponibile
          if (type) {
            console.log(`🚀 fetchForCity for "${city}" with type filter: "${type}"`);
          }
          
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

          // Determina il tipo naturale basandosi sul nome della città
          const getNaturalDestinationType = () => {
            const cityLower = cityName.toLowerCase();
            
            // Beach/Mare - destinazioni costiere e balneari (almeno 6 per continente)
            const beachDestinations = [
              // Europa (20+)
              'santorini', 'mykonos', 'crete', 'rhodes', 'ibiza', 'mallorca', 'menorca', 'valencia', 'barcelona', 'marbella', 'costa del sol', 'nice', 'cannes', 'saint-tropez', 'corsica', 'sardinia', 'capri', 'amalfi', 'positano', 'portofino', 'cinque terre', 'rimini', 'riccione', 'dubrovnik', 'split', 'hvar', 'malta', 'cyprus', 'algarve', 'madeira', 'canary islands',
              // Asia (20+)
              'maldive', 'bali', 'lombok', 'phuket', 'koh samui', 'krabi', 'langkawi', 'penang', 'boracay', 'palawan', 'cebu', 'bohol', 'jeju', 'busan', 'okinawa', 'goa', 'kerala', 'andaman', 'sri lanka', 'bintan', 'batam', 'nha trang', 'da nang', 'phu quoc', 'hainan', 'sanya',
              // America (20+)
              'cancun', 'playa del carmen', 'tulum', 'cozumel', 'miami', 'key west', 'myrtle beach', 'outer banks', 'hawaii', 'honolulu', 'maui', 'waikiki', 'bahamas', 'barbados', 'aruba', 'jamaica', 'puerto rico', 'rio de janeiro', 'copacabana', 'ipanema', 'florianopolis', 'cabo', 'acapulco', 'puerto vallarta', 'cartagena', 'san diego', 'santa monica', 'malibu',
              // Africa (10+)
              'zanzibar', 'pemba', 'seychelles', 'mauritius', 'cape town', 'durban', 'marrakech', 'essaouira', 'sharm el sheikh', 'hurghada', 'djerba', 'agadir', 'casablanca',
              // Oceania (10+)
              'gold coast', 'sunshine coast', 'byron bay', 'cairns', 'whitsundays', 'fraser island', 'rottnest', 'broome', 'fiji', 'tahiti', 'vanuatu', 'new caledonia', 'cook islands'
            ];
            
            // Mountain/Montagna - destinazioni montane e sciistiche (almeno 6 per continente)
            const mountainDestinations = [
              // Europa (25+)
              'zermatt', 'chamonix', 'st. moritz', 'interlaken', 'grindelwald', 'lauterbrunnen', 'verbier', 'davos', 'gstaad', 'innsbruck', 'salzburg', 'hallstatt', 'cortina', 'val gardena', 'madonna di campiglio', 'courmayeur', 'cervinia', 'livigno', 'bormio', 'andorra', 'val d\'aran', 'sierra nevada', 'pyrenees', 'dolomites', 'bavarian alps', 'black forest', 'scottish highlands', 'ben nevis', 'snowdonia', 'norwegian fjords', 'lofoten', 'lapland', 'tatras', 'carpathians', 'julian alps',
              // Asia (20+)
              'everest', 'annapurna', 'kathmandu', 'pokhara', 'lhasa', 'tibet', 'bhutan', 'thimphu', 'kashmir', 'ladakh', 'leh', 'shimla', 'manali', 'dharamshala', 'darjeeling', 'gangtok', 'japan alps', 'hakone', 'nikko', 'takayama', 'shirakawa', 'aso', 'fuji', 'jeju hallasan', 'seoraksan', 'jirisan', 'changbai', 'tianshan', 'altai', 'ural', 'caucasus', 'kazbegi', 'svaneti',
              // America (20+)
              'banff', 'jasper', 'whistler', 'aspen', 'vail', 'jackson hole', 'park city', 'mammoth', 'lake tahoe', 'yosemite', 'glacier national park', 'rocky mountain', 'grand teton', 'yellowstone', 'big sur', 'cusco', 'machu picchu', 'la paz', 'quito', 'bariloche', 'mendoza', 'patagonia', 'torres del paine', 'ushuaia', 'el calafate', 'aconcagua', 'andes', 'appalachian',
              // Africa (8+)
              'kilimanjaro', 'moshi', 'mount kenya', 'rwenzori', 'atlas mountains', 'toubkal', 'marrakech', 'imlil', 'table mountain', 'drakensberg', 'lesotho', 'simien mountains',
              // Oceania (8+)
              'blue mountains', 'snowy mountains', 'cradle mountain', 'mount cook', 'aoraki', 'queenstown', 'wanaka', 'mount aspiring', 'fiordland', 'arthur\'s pass', 'fox glacier', 'franz josef'
            ];
            
            // Culture/Cultura - destinazioni ricche di storia e arte (almeno 6 per continente)
            const cultureDestinations = [
              // Europa (40+)
              'rome', 'roma', 'florence', 'firenze', 'venice', 'venezia', 'naples', 'napoli', 'palermo', 'siracusa', 'lecce', 'matera', 'ravenna', 'pisa', 'siena', 'assisi', 'urbino', 'mantova', 'bergamo', 'verona', 'padova', 'bologna', 'ferrara', 'modena', 'parma', 'athens', 'santorini', 'delphi', 'meteora', 'crete', 'rhodes', 'paris', 'versailles', 'loire valley', 'avignon', 'arles', 'carcassonne', 'madrid', 'toledo', 'seville', 'granada', 'cordoba', 'santiago', 'barcelona', 'segovia', 'salamanca', 'porto', 'lisbon', 'sintra', 'obidos', 'vienna', 'salzburg', 'prague', 'cesky krumlov', 'budapest', 'krakow', 'warsaw', 'gdansk', 'vilnius', 'riga', 'tallinn', 'helsinki', 'stockholm', 'copenhagen', 'oslo', 'bergen', 'amsterdam', 'bruges', 'ghent', 'brussels', 'luxembourg', 'zurich', 'basel', 'bern', 'istanbul', 'cappadocia', 'ephesus', 'pamukkale', 'troy', 'edinburgh', 'glasgow', 'york', 'bath', 'canterbury', 'dublin', 'galway', 'kilkenny', 'moscow', 'st petersburg', 'novgorod', 'kazan',
              // Asia (35+)
              'kyoto', 'nara', 'nikko', 'kamakura', 'hiroshima', 'kanazawa', 'takayama', 'beijing', 'xian', 'shanghai', 'guilin', 'lijiang', 'pingyao', 'luoyang', 'kaifeng', 'hong kong', 'macau', 'taipei', 'tainan', 'seoul', 'gyeongju', 'busan', 'andong', 'jeonju', 'siem reap', 'angkor wat', 'phnom penh', 'battambang', 'luang prabang', 'vientiane', 'hanoi', 'hue', 'hoi an', 'ho chi minh', 'ayutthaya', 'sukhothai', 'chiang mai', 'lopburi', 'kathmandu', 'bhaktapur', 'patan', 'lhasa', 'shigatse', 'thimphu', 'paro', 'varanasi', 'agra', 'jaipur', 'udaipur', 'jodhpur', 'delhi', 'amritsar', 'khajuraho', 'hampi', 'mysore', 'madurai', 'kochi', 'goa', 'mumbai', 'pune', 'aurangabad', 'ajanta', 'ellora', 'colombo', 'kandy', 'anuradhapura', 'polonnaruwa', 'galle', 'yogyakarta', 'borobudur', 'prambanan', 'solo', 'jakarta', 'bandung', 'bagan', 'mandalay', 'inle lake', 'yangon', 'samarkand', 'bukhara', 'khiva', 'tashkent', 'isfahan', 'shiraz', 'persepolis', 'yazd', 'kerman', 'petra', 'jerash', 'amman', 'jerusalem', 'bethlehem', 'nazareth', 'acre', 'damascus', 'aleppo', 'palmyra', 'bosra', 'doha', 'kuwait city', 'muscat', 'nizwa', 'salalah', 'sanaa', 'shibam', 'socotra',
              // America (25+)
              'mexico city', 'oaxaca', 'merida', 'campeche', 'san cristobal', 'puebla', 'guanajuato', 'morelia', 'zacatecas', 'guadalajara', 'cusco', 'machu picchu', 'lima', 'arequipa', 'trujillo', 'chachapoyas', 'cajamarca', 'quito', 'cuenca', 'otavalo', 'riobamba', 'cartagena', 'santa marta', 'villa de leyva', 'popayan', 'mompox', 'bogota', 'medellin', 'cali', 'havana', 'trinidad', 'cienfuegos', 'camaguey', 'santiago de cuba', 'antigua', 'granada', 'leon', 'washington dc', 'philadelphia', 'boston', 'charleston', 'savannah', 'new orleans', 'santa fe', 'san antonio', 'quebec city', 'montreal', 'salvador', 'ouro preto', 'paraty', 'olinda', 'sao luis', 'diamantina', 'tiradentes', 'buenos aires', 'cordoba', 'salta', 'montevideo', 'colonia sacramento', 'la paz', 'sucre', 'potosi', 'santa cruz',
              // Africa (15+)
              'cairo', 'luxor', 'aswan', 'alexandria', 'edfu', 'kom ombo', 'abu simbel', 'marrakech', 'fez', 'meknes', 'rabat', 'chefchaouen', 'essaouira', 'ouarzazate', 'ait benhaddou', 'tunis', 'carthage', 'kairouan', 'sidi bou said', 'addis ababa', 'lalibela', 'axum', 'gondar', 'harar', 'stone town', 'kilwa', 'great zimbabwe', 'cape town', 'stellenbosch', 'johannesburg', 'pretoria', 'durban', 'bloemfontein', 'kimberley', 'grahamstown', 'port elizabeth', 'east london', 'timbuktu', 'djenne', 'bamako', 'mopti', 'gao', 'segou',
              // Oceania (12+)
              'sydney', 'melbourne', 'adelaide', 'perth', 'hobart', 'darwin', 'canberra', 'ballarat', 'bendigo', 'beechworth', 'sovereign hill', 'port arthur', 'fremantle', 'albany', 'auckland', 'wellington', 'christchurch', 'dunedin', 'napier', 'rotorua', 'russell', 'waitangi', 'picton', 'queenstown', 'invercargill'
            ];
            
            // Nature/Natura - parchi naturali e riserve (almeno 6 per continente)
            const natureDestinations = [
              // Europa (15+)
              'iceland', 'reykjavik', 'geysir', 'gullfoss', 'faroe islands', 'lofoten', 'nordkapp', 'tromsø', 'lapland', 'finland', 'karelia', 'lake bled', 'plitvice', 'krka', 'azores', 'madeira', 'canary islands', 'corsica', 'dolomites', 'gran paradiso', 'black forest', 'bavarian forest', 'tatra', 'carpathians', 'danube delta',
              // Asia (20+)
              'himalaya', 'everest', 'annapurna', 'tibet', 'bhutan', 'kashmir', 'ladakh', 'himachal pradesh', 'uttarakhand', 'valley of flowers', 'chitwan', 'bardia', 'ranthambore', 'kaziranga', 'sundarbans', 'komodo', 'borneo', 'sumatra', 'java', 'raja ampat', 'bunaken', 'flores', 'gobi desert', 'altai mountains', 'kamchatka',
              // America (20+)
              'yellowstone', 'yosemite', 'grand canyon', 'bryce canyon', 'zion', 'arches', 'glacier national park', 'denali', 'everglades', 'redwood', 'sequoia', 'amazon rainforest', 'pantanal', 'iguazu falls', 'patagonia', 'torres del paine', 'galapagos islands', 'costa rica', 'manuel antonio', 'monteverde', 'tortuguero', 'belize barrier reef', 'tikal', 'cenotes',
              // Africa (15+)
              'serengeti', 'ngorongoro crater', 'masai mara', 'amboseli', 'tsavo', 'kruger national park', 'chobe', 'okavango delta', 'victoria falls', 'sahara desert', 'sossusvlei', 'fish river canyon', 'drakensberg', 'garden route', 'madagascar', 'socotra island',
              // Oceania (12+)
              'great barrier reef', 'uluru', 'kakadu', 'blue mountains', 'grampians', 'kangaroo island', 'tasmania', 'cradle mountain', 'milford sound', 'fiordland', 'bay of islands', 'coromandel', 'abel tasman', 'franz josef glacier', 'mount cook'
            ];
            
            // Countryside/Campagna - zone rurali e agricole (almeno 6 per continente)
            const countrysideDestinations = [
              // Europa (25+)
              'tuscany', 'toscana', 'chianti', 'val d\'orcia', 'montalcino', 'montepulciano', 'pienza', 'san gimignano', 'volterra', 'cortona', 'umbria', 'assisi', 'spoleto', 'orvieto', 'todi', 'gubbio', 'provence', 'luberon', 'var', 'vaucluse', 'loire valley', 'bordeaux', 'burgundy', 'champagne', 'alsace', 'normandy', 'brittany', 'dordogne', 'languedoc', 'cotswolds', 'lake district', 'yorkshire dales', 'devon', 'cornwall', 'peak district', 'scottish highlands', 'hebrides', 'orkney', 'shetland', 'ireland countryside', 'ring of kerry', 'connemara', 'dingle', 'wicklow', 'cork', 'kerry', 'clare', 'galway', 'mayo', 'donegal', 'black forest', 'rhine valley', 'mosel', 'bavaria', 'allgau', 'salzkammergut', 'wachau', 'styria', 'carinthia', 'tyrol', 'douro valley', 'alentejo', 'minho', 'beiras', 'ribatejo', 'andalusia', 'castile', 'galicia', 'asturias', 'cantabria', 'basque country', 'navarre', 'aragon', 'extremadura', 'murcia',
              // Asia (15+)
              'rice terraces', 'banaue', 'sapa', 'guilin', 'yangshuo', 'lijiang', 'dali', 'shangri la', 'kashmir valley', 'himachal pradesh', 'uttarakhand', 'kerala backwaters', 'goa countryside', 'rajasthan villages', 'punjab fields', 'haryana', 'uttar pradesh', 'bihar', 'west bengal', 'odisha', 'andhra pradesh', 'telangana', 'karnataka', 'tamil nadu', 'jeju countryside', 'gyeongju', 'andong', 'jeonju', 'takayama', 'shirakawa go', 'noto peninsula', 'aso kuju', 'kumano kodo', 'bali countryside', 'yogyakarta', 'solo', 'bandung', 'malang', 'ubud', 'sidemen', 'munduk', 'jatiluwih', 'tabanan', 'gianyar', 'klungkung', 'bangli', 'karangasem', 'buleleng',
              // America (20+)
              'napa valley', 'sonoma', 'mendocino', 'paso robles', 'central coast', 'finger lakes', 'hudson valley', 'long island', 'new england', 'vermont', 'new hampshire', 'maine countryside', 'massachusetts', 'connecticut', 'rhode island', 'appalachian mountains', 'blue ridge', 'great smoky mountains', 'ozarks', 'hill country', 'texas hill country', 'mendoza', 'colchagua valley', 'casablanca valley', 'maipo valley', 'aconcagua valley', 'san antonio valley', 'uruguay countryside', 'canelones', 'maldonado', 'rocha', 'pampas', 'serra gaucha', 'vale dos vinhedos', 'bento goncalves', 'caxias do sul', 'minas gerais', 'serra da mantiqueira', 'campos do jordao', 'monte verde', 'bahia countryside', 'chapada diamantina', 'vale do capao', 'lencois', 'coffee triangle colombia', 'armenia', 'pereira', 'manizales', 'valle del cauca', 'cali', 'popayan', 'central valley costa rica', 'san jose province', 'alajuela', 'cartago', 'heredia', 'puntarenas', 'guanacaste',
              // Africa (12+)
              'wine lands', 'stellenbosch', 'franschhoek', 'paarl', 'hermanus', 'walker bay', 'overberg', 'garden route', 'karoo', 'drakensberg foothills', 'mpumalanga', 'limpopo', 'north west', 'free state', 'northern cape', 'eastern cape', 'western cape', 'kwazulu natal', 'atlas foothills', 'middle atlas', 'rif mountains', 'sahara oases', 'nile valley', 'red sea hills', 'ethiopian highlands', 'rift valley', 'masai villages', 'samburu lands', 'turkana', 'pokot', 'kalenjin', 'kikuyu highlands', 'meru', 'embu', 'machakos', 'kiambu',
              // Oceania (15+)
              'hunter valley', 'barossa valley', 'clare valley', 'adelaide hills', 'mclaren vale', 'coonawarra', 'langhorne creek', 'eden valley', 'riverland', 'yarra valley', 'mornington peninsula', 'bellarine peninsula', 'geelong', 'macedon ranges', 'heathcote', 'goulburn valley', 'king valley', 'alpine valleys', 'rutherglen', 'beechworth', 'grampians', 'pyrenees', 'henty', 'great western', 'sunbury', 'swan valley', 'margaret river', 'great southern', 'peel', 'perth hills', 'blackwood valley', 'geographe', 'pemberton', 'manjimup', 'mount barker', 'frankland river', 'denmark', 'albany', 'porongurup', 'stirling range', 'central otago', 'marlborough', 'nelson', 'canterbury', 'hawkes bay', 'gisborne', 'wairarapa', 'auckland', 'northland', 'waikato', 'bay of plenty', 'taranaki', 'manawatu', 'wanganui', 'wellington', 'west coast', 'southland', 'otago'
            ];
            
            if (cityLower.includes('beach') || cityLower.includes('coast') || 
                beachDestinations.some(beach => cityLower.includes(beach))) {
              console.log(`🏖️ ${cityName} -> beach (matched pattern)`);
              return 'beach';
            }
            
            if (cityLower.includes('mountain') || cityLower.includes('alps') ||
                mountainDestinations.some(mountain => cityLower.includes(mountain))) {
              console.log(`⛰️ ${cityName} -> mountain (matched pattern)`);
              return 'mountain';
            }
            
            if (cultureDestinations.some(culture => cityLower.includes(culture))) {
              console.log(`🏛️ ${cityName} -> culture (matched pattern)`);
              return 'culture';
            }
            
            if (natureDestinations.some(nature => cityLower.includes(nature))) {
              console.log(`🌿 ${cityName} -> nature (matched pattern)`);
              return 'nature';
            }
            
            if (countrysideDestinations.some(country => cityLower.includes(country))) {
              console.log(`🌾 ${cityName} -> countryside (matched pattern)`);
              return 'countryside';
            }
            
            // Logica di fallback più intelligente basata su parole chiave generiche
            
            // Parole chiave che indicano destinazioni balneari
            if (cityLower.includes('beach') || cityLower.includes('bay') || cityLower.includes('coast') || 
                cityLower.includes('island') || cityLower.includes('resort') || cityLower.includes('marina') ||
                cityLower.includes('riviera') || cityLower.includes('cabo') || cityLower.includes('playa') ||
                cityLower.includes('surf') || cityLower.includes('coral') || cityLower.includes('lagoon')) {
              console.log(`🏖️ ${cityName} -> beach (keyword fallback)`);
              return 'beach';
            }
            
            // Parole chiave che indicano destinazioni montane
            if (cityLower.includes('mount') || cityLower.includes('peak') || cityLower.includes('valley') ||
                cityLower.includes('ski') || cityLower.includes('alpine') || cityLower.includes('highland') ||
                cityLower.includes('glacier') || cityLower.includes('summit') || cityLower.includes('ridge') ||
                cityLower.includes('pass') || cityLower.includes('canyon') || cityLower.includes('gorge')) {
              console.log(`⛰️ ${cityName} -> mountain (keyword fallback)`);
              return 'mountain';
            }
            
            // Parole chiave che indicano destinazioni naturali
            if (cityLower.includes('national park') || cityLower.includes('reserve') || cityLower.includes('forest') ||
                cityLower.includes('safari') || cityLower.includes('wildlife') || cityLower.includes('jungle') ||
                cityLower.includes('rainforest') || cityLower.includes('desert') || cityLower.includes('oasis') ||
                cityLower.includes('falls') || cityLower.includes('crater') || cityLower.includes('reef')) {
              console.log(`🌿 ${cityName} -> nature (keyword fallback)`);
              return 'nature';
            }
            
            // Parole chiave che indicano destinazioni rurali/campagna
            if (cityLower.includes('village') || cityLower.includes('vineyard') || cityLower.includes('winery') ||
                cityLower.includes('countryside') || cityLower.includes('farm') || cityLower.includes('ranch') ||
                cityLower.includes('valley') || cityLower.includes('hills') || cityLower.includes('meadow') ||
                cityLower.includes('pastoral') || cityLower.includes('rural') || cityLower.includes('estate')) {
              console.log(`🌾 ${cityName} -> countryside (keyword fallback)`);
              return 'countryside';
            }
            
            // Distribuzione intelligente per evitare troppi risultati "city"
            // Usa l'hash del nome della città per una distribuzione deterministica ma varia
            const hash = cityName.split('').reduce((a: number, b: string) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            
            const remainder = Math.abs(hash) % 100;
            
            // Distribuisci le città "generiche" tra tutti i tipi
            if (remainder < 15) {
              console.log(`🏛️ ${cityName} -> culture (smart distribution)`);
              return 'culture';
            } else if (remainder < 25) {
              console.log(`🌿 ${cityName} -> nature (smart distribution)`);
              return 'nature';
            } else if (remainder < 35) {
              console.log(`�️ ${cityName} -> beach (smart distribution)`);
              return 'beach';
            } else if (remainder < 45) {
              console.log(`⛰️ ${cityName} -> mountain (smart distribution)`);
              return 'mountain';
            } else if (remainder < 55) {
              console.log(`🌾 ${cityName} -> countryside (smart distribution)`);
              return 'countryside';
            } else {
              console.log(`🏙️ ${cityName} -> city (smart distribution)`);
              return 'city';
            }
          };

          const naturalType = getNaturalDestinationType();
          
          // Debug logging per il filtraggio dei tipi
          if (type) {
            console.log(`🎯 Type filter: expecting "${type}", found "${naturalType}" for ${cityName}`);
          }
          
          // Se è specificato un filtro per tipo, filtra solo le destinazioni che corrispondono
          if (type && naturalType !== type) {
            console.log(`❌ Filtering out ${cityName} - expected "${type}", got "${naturalType}"`);
            return null; // Scarta questa destinazione se non corrisponde al filtro
          }
          
          if (type && naturalType === type) {
            console.log(`✅ Keeping ${cityName} - matches type "${type}"`);
          }

          const destinationType = naturalType;

          return {
            id: suggestion.id,
            name: cityName,
            country,
            lat: suggestion.lat,
            lon: suggestion.lon,
            image: imageUrl,
            rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
            
            budget: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
            type: destinationType,
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
            setAllDestinations(currentDestinations => {
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
          setAllDestinations((currentDestinations) => {
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
    setAllDestinations([]);
    setDestinations([]);
    fetchDestinations();
  }, [searchQuery, seedParam, continent, type]); // Include 'type' per gestire i cambi da/verso "tutti i tipi"

  // Filtraggio in tempo reale delle destinazioni caricate quando necessario
  useEffect(() => {
    if (allDestinations.length > 0) {
      if (!type) {
        // Se non c'è filtro tipo, mostra tutte le destinazioni caricate
        console.log('🔄 No type filter, showing all destinations:', allDestinations.length);
        setDestinations(allDestinations);
      } else {
        // Filtra le destinazioni già caricate in base al tipo
        console.log('🎯 Filtering destinations by type:', type, 'from total:', allDestinations.length);
        const filtered = allDestinations.filter(dest => {
          const matches = dest.type === type;
          if (matches) {
            console.log('✅ Keeping:', dest.name, 'type:', dest.type);
          } else {
            console.log('❌ Filtering out:', dest.name, 'type:', dest.type, 'expected:', type);
          }
          return matches;
        });
        console.log('🔍 Filtered results:', filtered.length, 'destinations');
        setDestinations(filtered);
      }
    }
  }, [type, allDestinations]); // Solo quando cambia il tipo o le destinazioni sono caricate

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

  // Crea una chiave unica per i filtri per resettare la paginazione
  const filtersKey = `${continent || ''}-${type || ''}-${urlContinent || ''}-${urlType || ''}-${searchQuery || ''}`;
  
  // Reset della paginazione quando cambiano i filtri
  if (filtersKey !== lastFiltersKey) {
    setCurrentPage(1);
    setLastFiltersKey(filtersKey);
  }



  // Filtra destinazioni incomplete per evitare errori di rendering
  const validDestinations = destinations.filter(dest => 
    dest && dest.name && dest.country && dest.image
  );

  // Calcola la paginazione semplice
  const totalItems = validDestinations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDestinations = validDestinations.slice(startIndex, endIndex);
  
  // Verifica se ci sono dati per la pagina corrente
  const hasDataForCurrentPage = currentDestinations.length > 0;

  // Funzione per gestire il cambio pagina
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <div className={`grid ${variant === 'hero' ? 'grid-cols-1 md:grid-cols-3 gap-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'} pb-12`}>
      <AnimatePresence>
        {currentDestinations.map((destination, index) => (
          <motion.div
            key={destination.id}
            layout
            initial={{ opacity: 0, y: 60, rotateY: -15 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
            className={`group cursor-pointer rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ${
              variant === 'hero' 
                ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30' 
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
            }`}
            onClick={() => {
              // Naviga alla pagina di ricerca per la destinazione
              router.push(`/destinations?search=${encodeURIComponent(destination.name)}`);
            }}
          >
            <div className="relative h-64 overflow-hidden">
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <CityImage
                  src={destination.image || ''}
                  alt={`${destination.name || 'Destinazione'}, ${destination.country || 'Mondo'}`}
                  cityName={destination.name || 'Destinazione'}
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Pulsante Preferiti */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(destination);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isFavorite(destination.name) 
                      ? 'text-red-500 fill-current' 
                      : 'text-gray-800 dark:text-gray-200'
                  }`} 
                />
              </motion.button>

              {/* Badge valutazione */}
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-black dark:text-white">{destination.rating?.toFixed(1) || 'N/A'}</span>
              </div>

            </div>
            
            <div className={`p-6 ${variant === 'hero' ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm' : 'bg-white dark:bg-gray-800'}`}>
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
                   destination.type === 'nature' ? '�' :
                   destination.type === 'countryside' ? '�🌾' : '🗺️'}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm leading-relaxed">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigazione client-side verso i dettagli live — includi l'URL dell'immagine scelta così la pagina di dettaglio mostra la stessa foto
                      const params = new URLSearchParams({ name: destination.name, lat: String(destination.lat), lon: String(destination.lon) });
                      if (destination.image) params.set('image', destination.image);
                      router.push(`/destinations/live?${params.toString()}`);
                    }}
                  >
                    Scopri di più
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      </div>

      {/* Interfaccia di paginazione */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 mb-8">
          {/* Pulsante Previous */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-300 dark:border-gray-600'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Precedente
          </motion.button>

          {/* Numeri di pagina */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostra sempre la prima, ultima e le pagine vicine a quella corrente
              const shouldShow = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!shouldShow) {
                // Mostra i puntini solo una volta
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-gray-400 dark:text-gray-600">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {page}
                </motion.button>
              );
            })}
          </div>

          {/* Pulsante Next */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Successiva
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Indicatore di caricamento */}
      {loading && totalItems < (maxItems || 48) && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          <div className="flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Caricamento destinazioni...</span>
          </div>
        </div>
      )}
    </div>
  );
}
