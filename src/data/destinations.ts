import { Destination, BlogPost } from '@/types';

export const destinations: Destination[] = [
  {
    id: '1',
    name: 'Santorini',
    country: 'Grecia',
    continent: 'Europe',
    description: 'Un\'isola vulcanica delle Cicladi famosa per i suoi tramonti mozzafiato, architettura bianca e blu, e spiagge uniche.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800&h=600&fit=crop'
    ],
    budget: 'high',
    type: 'beach',
    rating: 4.8,
    coordinates: { lat: 36.3932, lng: 25.4615 },
    bestTimeToVisit: ['Aprile', 'Maggio', 'Settembre', 'Ottobre'],
    duration: '5-7 giorni',
    activities: [
      {
        id: '1-1',
        name: 'Tramonto a Oia',
        description: 'Ammira uno dei tramonti più belli del mondo',
        icon: '🌅',
        duration: '2 ore'
      },
      {
        id: '1-2',
        name: 'Wine Tasting',
        description: 'Degusta i vini vulcanici locali',
        icon: '🍷',
        duration: '3 ore',
        price: 45
      },
      {
        id: '1-3',
        name: 'Spiaggia Rossa',
        description: 'Visita la famosa spiaggia di sabbia rossa',
        icon: '🏖️',
        duration: '4 ore'
      }
    ]
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Giappone',
    continent: 'Asia',
    description: 'La vibrante capitale del Giappone che combina perfettamente tradizione e modernità.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop'
    ],
    budget: 'high',
    type: 'city',
    rating: 4.9,
    coordinates: { lat: 35.6762, lng: 139.6503 },
    bestTimeToVisit: ['Marzo', 'Aprile', 'Maggio', 'Ottobre', 'Novembre'],
    duration: '7-10 giorni',
    activities: [
      {
        id: '2-1',
        name: 'Tempio Senso-ji',
        description: 'Visita il tempio più antico di Tokyo',
        icon: '⛩️',
        duration: '2 ore'
      },
      {
        id: '2-2',
        name: 'Shibuya Crossing',
        description: 'Attraversa il famoso incrocio più trafficato del mondo',
        icon: '🚶',
        duration: '1 ora'
      },
      {
        id: '2-3',
        name: 'Mercato del pesce Tsukiji',
        description: 'Assaggia il sushi più fresco al mondo',
        icon: '🍣',
        duration: '3 ore',
        price: 60
      }
    ]
  },
  {
    id: '3',
    name: 'Machu Picchu',
    country: 'Perù',
    continent: 'South America',
    description: 'L\'antica cittadella inca situata nelle montagne delle Ande peruviane.',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'mountain',
    rating: 4.7,
    coordinates: { lat: -13.1631, lng: -72.5450 },
    bestTimeToVisit: ['Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre'],
    duration: '3-5 giorni',
    activities: [
      {
        id: '3-1',
        name: 'Trekking Inca Trail',
        description: 'Percorri l\'antico sentiero degli Inca',
        icon: '🥾',
        duration: '4 giorni',
        price: 200
      },
      {
        id: '3-2',
        name: 'Huayna Picchu',
        description: 'Sali sulla montagna sacra degli Inca',
        icon: '⛰️',
        duration: '3 ore',
        price: 25
      },
      {
        id: '3-3',
        name: 'Valle Sacra',
        description: 'Esplora i siti archeologici della valle',
        icon: '🏛️',
        duration: '6 ore'
      }
    ]
  },
  {
    id: '4',
    name: 'Maldive',
    country: 'Maldive',
    continent: 'Asia',
    description: 'Paradiso tropicale con spiagge di sabbia bianca e acque cristalline.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop'
    ],
    budget: 'high',
    type: 'beach',
    rating: 4.9,
    coordinates: { lat: 3.2028, lng: 73.2207 },
    bestTimeToVisit: ['Novembre', 'Dicembre', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile'],
    duration: '7-14 giorni',
    activities: [
      {
        id: '4-1',
        name: 'Snorkeling',
        description: 'Esplora i reef corallini',
        icon: '🤿',
        duration: '3 ore',
        price: 80
      },
      {
        id: '4-2',
        name: 'Cena sottomarina',
        description: 'Cena in un ristorante sott\'acqua',
        icon: '🍽️',
        duration: '2 ore',
        price: 300
      },
      {
        id: '4-3',
        name: 'Spa overwater',
        description: 'Rilassati in una spa sull\'acqua',
        icon: '💆',
        duration: '2 ore',
        price: 150
      }
    ]
  },
  {
    id: '5',
    name: 'Parigi',
    country: 'Francia',
    continent: 'Europe',
    description: 'La città dell\'amore, famosa per arte, moda, gastronomia e cultura.',
    image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'city',
    rating: 4.6,
    coordinates: { lat: 48.8566, lng: 2.3522 },
    bestTimeToVisit: ['Aprile', 'Maggio', 'Giugno', 'Settembre', 'Ottobre'],
    duration: '4-7 giorni',
    activities: [
      {
        id: '5-1',
        name: 'Torre Eiffel',
        description: 'Sali sulla torre simbolo di Parigi',
        icon: '🗼',
        duration: '2 ore',
        price: 25
      },
      {
        id: '5-2',
        name: 'Louvre',
        description: 'Visita il museo più famoso del mondo',
        icon: '🖼️',
        duration: '4 ore',
        price: 17
      },
      {
        id: '5-3',
        name: 'Crociera sulla Senna',
        description: 'Ammira Parigi dal fiume',
        icon: '🚢',
        duration: '1.5 ore',
        price: 15
      }
    ]
  },
  {
    id: '6',
    name: 'Bali',
    country: 'Indonesia',
    continent: 'Asia',
    description: 'Isola tropicale famosa per templi, risaie terrazzate e spiagge paradisiache.',
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539367628448-4bc5c9ddb2ff?w=800&h=600&fit=crop'
    ],
    budget: 'low',
    type: 'beach',
    rating: 4.5,
    coordinates: { lat: -8.3405, lng: 115.0920 },
    bestTimeToVisit: ['Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre'],
    duration: '7-14 giorni',
    activities: [
      {
        id: '6-1',
        name: 'Tempio Tanah Lot',
        description: 'Visita il tempio sul mare',
        icon: '🏛️',
        duration: '2 ore'
      },
      {
        id: '6-2',
        name: 'Risaie di Jatiluwih',
        description: 'Esplora le terrazze di riso UNESCO',
        icon: '🌾',
        duration: '4 ore'
      },
      {
        id: '6-3',
        name: 'Surf a Uluwatu',
        description: 'Cavalca le onde perfette',
        icon: '🏄',
        duration: '3 ore',
        price: 40
      }
    ]
  }
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Consigli per Viaggiare con un Budget Limitato',
    slug: 'viaggiare-budget-limitato',
    excerpt: 'Scopri come esplorare il mondo senza spendere una fortuna con questi consigli pratici.',
    content: 'Viaggiare non deve necessariamente costare una fortuna. Con un po\' di pianificazione e alcuni trucchi...',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
    author: 'Marco Rossi',
    publishedAt: '2024-01-15',
    readTime: 8,
    tags: ['budget', 'consigli', 'risparmio']
  },
  {
    id: '2',
    title: 'Le Destinazioni Più Instagrammabili del 2024',
    slug: 'destinazioni-instagrammabili-2024',
    excerpt: 'I luoghi più fotogenici che faranno brillare il tuo feed Instagram.',
    content: 'Nell\'era dei social media, molti viaggiatori cercano destinazioni che offrano...',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    author: 'Laura Bianchi',
    publishedAt: '2024-01-10',
    readTime: 6,
    tags: ['instagram', 'fotografia', 'social']
  },
  {
    id: '3',
    title: 'Guida Completa al Viaggio Sostenibile',
    slug: 'viaggio-sostenibile-guida',
    excerpt: 'Come ridurre l\'impatto ambientale dei tuoi viaggi e viaggiare in modo responsabile.',
    content: 'Il turismo sostenibile sta diventando sempre più importante. Ecco come puoi...',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
    author: 'Francesco Verde',
    publishedAt: '2024-01-05',
    readTime: 12,
    tags: ['sostenibilità', 'ambiente', 'ecoturismo']
  }
];