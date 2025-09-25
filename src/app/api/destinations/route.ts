import { NextRequest, NextResponse } from 'next/server';
import { Destination } from '@/types';

// Cache in memoria per le destinazioni dinamiche
let cachedDestinations: Destination[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

// Converte LiveDestination a Destination standard
function convertToDestination(liveDestination: any): Destination {
  return {
    id: liveDestination.id || `dynamic-${Date.now()}-${Math.random()}`,
    name: liveDestination.name || 'Destinazione Sconosciuta',
    country: liveDestination.country || 'Paese Sconosciuto',
    continent: inferContinent(liveDestination.country || ''),
    description: liveDestination.description || `Scopri ${liveDestination.name || 'questa destinazione'} con la sua cultura, attrazioni ed esperienze uniche.`,
    image: liveDestination.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
    images: [liveDestination.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'],
    budget: liveDestination.budget || 'medium',
    type: liveDestination.type || 'city',
    coordinates: {
      lat: liveDestination.lat || 0,
      lng: liveDestination.lon || 0
    },
    bestTimeToVisit: ['Tutto l\'anno'],
    duration: '3-5 giorni',
    activities: [
      {
        id: '1',
        name: 'Esplorazione',
        description: 'Scopri i luoghi più interessanti',
        icon: '🗺️',
        duration: '4 ore'
      }
    ]
  };
}

function inferContinent(country: string): string {
  const c = country.toLowerCase();
  
  // Europa
  if (['italia', 'italy', 'francia', 'france', 'spagna', 'spain', 'germania', 'germany', 'regno unito', 'uk', 'united kingdom', 'grecia', 'greece', 'austria', 'svizzera', 'switzerland', 'olanda', 'netherlands', 'belgio', 'belgium', 'portogallo', 'portugal', 'norvegia', 'norway', 'svezia', 'sweden', 'danimarca', 'denmark', 'finlandia', 'finland', 'repubblica ceca', 'czech republic', 'ungheria', 'hungary', 'polonia', 'poland', 'croazia', 'croatia', 'slovenia', 'slovacchia', 'slovakia', 'romania', 'bulgaria', 'estonia', 'latvia', 'lithuania'].some(eu => c.includes(eu))) {
    return 'Europe';
  }
  
  // Asia
  if (['giappone', 'japan', 'cina', 'china', 'corea', 'korea', 'thailandia', 'thailand', 'vietnam', 'singapore', 'malesia', 'malaysia', 'indonesia', 'filippine', 'philippines', 'india', 'nepal', 'tibet', 'myanmar', 'cambogia', 'cambodia', 'laos', 'bangladesh', 'sri lanka', 'maldive', 'maldives', 'dubai', 'uae', 'emirati arabi uniti', 'arabia saudita', 'saudi arabia', 'qatar', 'kuwait', 'oman', 'bahrain', 'turchia', 'turkey', 'georgia', 'armenia', 'azerbaijan'].some(as => c.includes(as))) {
    return 'Asia';
  }
  
  // America
  if (['stati uniti', 'usa', 'united states', 'canada', 'messico', 'mexico', 'brasile', 'brazil', 'argentina', 'cile', 'chile', 'peru', 'colombia', 'venezuela', 'ecuador', 'bolivia', 'uruguay', 'paraguay', 'guyana', 'suriname', 'costa rica', 'panama', 'nicaragua', 'honduras', 'guatemala', 'belize', 'salvador', 'cuba', 'giamaica', 'jamaica', 'repubblica dominicana', 'dominican republic', 'haiti', 'bahamas', 'barbados', 'trinidad'].some(am => c.includes(am))) {
    return 'America';
  }
  
  // Africa
  if (['egitto', 'egypt', 'marocco', 'morocco', 'tunisia', 'algeria', 'libia', 'libya', 'sudan', 'etiopia', 'ethiopia', 'kenya', 'tanzania', 'uganda', 'ruanda', 'rwanda', 'congo', 'camerun', 'cameroon', 'nigeria', 'ghana', 'costa d\'avorio', 'senegal', 'mali', 'burkina faso', 'niger', 'ciad', 'chad', 'repubblica centrafricana', 'gabon', 'guinea', 'sierra leone', 'liberia', 'togo', 'benin', 'mauritania', 'gambia', 'guinea-bissau', 'capo verde', 'sao tome', 'madagascar', 'mauritius', 'seychelles', 'comoros', 'sudafrica', 'south africa', 'namibia', 'botswana', 'zimbabwe', 'zambia', 'malawi', 'mozambico', 'mozambique', 'lesotho', 'swaziland'].some(af => c.includes(af))) {
    return 'Africa';
  }
  
  // Oceania
  if (['australia', 'nuova zelanda', 'new zealand', 'fiji', 'papua nuova guinea', 'papua new guinea', 'vanuatu', 'samoa', 'tonga', 'palau', 'micronesia', 'isole marshall', 'nauru', 'tuvalu', 'kiribati', 'solomon islands', 'nuova caledonia', 'tahiti', 'polinesia francese', 'french polynesia'].some(oc => c.includes(oc))) {
    return 'Oceania';
  }
  
  return 'Unknown';
}

async function generateDynamicDestinations(): Promise<Destination[]> {
  try {
    // Simula le destinazioni dinamiche chiamando lo stesso endpoint interno del LiveDestinations
    const popularCities = [
      'Rome, Italy', 'Paris, France', 'Tokyo, Japan', 'New York, USA', 'London, UK',
      'Barcelona, Spain', 'Amsterdam, Netherlands', 'Prague, Czech Republic', 'Vienna, Austria',
      'Sydney, Australia', 'Cape Town, South Africa', 'Rio de Janeiro, Brazil', 'Bangkok, Thailand',
      'Dubai, UAE', 'Singapore, Singapore', 'Istanbul, Turkey', 'Athens, Greece', 'Cairo, Egypt',
      'Marrakech, Morocco', 'Kyoto, Japan', 'Buenos Aires, Argentina', 'Mexico City, Mexico',
      'Toronto, Canada', 'Mumbai, India', 'Beijing, China', 'Seoul, South Korea', 'Berlin, Germany',
      'Madrid, Spain', 'Lisbon, Portugal', 'Zurich, Switzerland', 'Stockholm, Sweden', 'Oslo, Norway',
      'Copenhagen, Denmark', 'Helsinki, Finland', 'Warsaw, Poland', 'Budapest, Hungary', 'Moscow, Russia'
    ];

    const destinations: Destination[] = [];
    
    for (let i = 0; i < Math.min(popularCities.length, 50); i++) {
      const city = popularCities[i];
      
      try {
        // Estrai nome città e paese
        const [cityName, country] = city.split(', ');
        
        const destination: Destination = {
          id: `dynamic-${i}`,
          name: cityName,
          country: country,
          continent: inferContinent(country),
          description: `Scopri ${cityName} con la sua cultura, attrazioni ed esperienze uniche.`,
          image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600&fit=crop`,
          images: [`https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600&fit=crop`],
          budget: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          type: inferType(cityName, country),
          coordinates: {
            lat: Math.random() * 180 - 90,
            lng: Math.random() * 360 - 180
          },
          bestTimeToVisit: ['Tutto l\'anno'],
          duration: '3-5 giorni',
          activities: [
            {
              id: `${i}-1`,
              name: 'Esplorazione del centro storico',
              description: `Scopri il centro storico di ${cityName}`,
              icon: '🏛️',
              duration: '4 ore'
            },
            {
              id: `${i}-2`,
              name: 'Tour gastronomico',
              description: `Assaggia la cucina locale di ${cityName}`,
              icon: '🍽️',
              duration: '3 ore',
              price: 45
            }
          ]
        };
        
        destinations.push(destination);
      } catch (err) {
        console.warn(`Error processing city ${city}:`, err);
      }
    }
    
    return destinations;
  } catch (error) {
    console.error('Error generating dynamic destinations:', error);
    
    // Fallback alle destinazioni statiche
    try {
      const { destinations: staticDestinations } = await import('@/data/destinations');
      return staticDestinations;
    } catch (fallbackErr) {
      console.error('Error loading fallback destinations:', fallbackErr);
      return [];
    }
  }
}

function inferType(cityName: string, country: string): 'city' | 'beach' | 'mountain' | 'countryside' | 'culture' | 'nature' {
  const city = cityName.toLowerCase();
  const ctry = country.toLowerCase();
  
  // Destinazioni naturali
  if (city.includes('park') || city.includes('forest') || city.includes('safari') || city.includes('jungle')) {
    return 'nature';
  }
  
  // Destinazioni balneari
  if (city.includes('beach') || city.includes('coast') || city.includes('island') || 
      ['maldives', 'mauritius', 'seychelles', 'bahamas', 'fiji'].some(beach => ctry.includes(beach))) {
    return 'beach';
  }
  
  // Destinazioni montane
  if (city.includes('mountain') || city.includes('alps') || city.includes('himalaya')) {
    return 'mountain';
  }
  
  // Destinazioni culturali
  if (['rome', 'athens', 'cairo', 'kyoto', 'jerusalem', 'istanbul', 'prague', 'florence'].some(culture => city.includes(culture))) {
    return 'culture';
  }
  
  // Default: città
  return 'city';
}

export async function GET(request: NextRequest) {
  try {
    // Controlla cache
    const now = Date.now();
    if (cachedDestinations.length > 0 && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({
        destinations: cachedDestinations,
        cached: true,
        timestamp: cacheTimestamp
      });
    }
    
    // Genera nuove destinazioni dinamiche
    const destinations = await generateDynamicDestinations();
    
    // Aggiorna cache
    cachedDestinations = destinations;
    cacheTimestamp = now;
    
    return NextResponse.json({
      destinations,
      cached: false,
      timestamp: cacheTimestamp,
      count: destinations.length
    });
    
  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch destinations',
        destinations: [],
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}