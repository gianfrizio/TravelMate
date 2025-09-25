import { Destination } from '@/types';

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
    type: 'culture',
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
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'city',
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
    type: 'nature',
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
  },
  {
    id: '7',
    name: 'Atene',
    country: 'Grecia',
    continent: 'Europe',
    description: 'Culla della civiltà occidentale con monumenti antichi straordinari.',
    image: 'https://images.unsplash.com/photo-1555993539-1732b0258c5e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555993539-1732b0258c5e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'culture',
    coordinates: { lat: 37.9755, lng: 23.7348 },
    bestTimeToVisit: ['Aprile', 'Maggio', 'Settembre', 'Ottobre'],
    duration: '3-5 giorni',
    activities: [
      {
        id: '7-1',
        name: 'Acropoli',
        description: 'Visita il Partenone e i templi antichi',
        icon: '🏛️',
        duration: '3 ore',
        price: 20
      },
      {
        id: '7-2',
        name: 'Museo Archeologico',
        description: 'Scopri i tesori dell\'antica Grecia',
        icon: '🏺',
        duration: '2 ore',
        price: 12
      }
    ]
  },
  {
    id: '8',
    name: 'Foresta Amazzonica',
    country: 'Brasile',
    continent: 'South America',
    description: 'Il polmone verde del mondo con biodiversità incredibile.',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'nature',
    coordinates: { lat: -3.4653, lng: -62.2159 },
    bestTimeToVisit: ['Giugno', 'Luglio', 'Agosto', 'Settembre'],
    duration: '5-8 giorni',
    activities: [
      {
        id: '8-1',
        name: 'Safari fotografico',
        description: 'Avvista animali selvatici unici',
        icon: '📸',
        duration: '6 ore',
        price: 120
      },
      {
        id: '8-2',
        name: 'Canoa nel Rio delle Amazzoni',
        description: 'Naviga nei misteriosi affluenti',
        icon: '🛶',
        duration: '4 ore',
        price: 80
      }
    ]
  },
  {
    id: '9',
    name: 'Petra',
    country: 'Giordania',
    continent: 'Asia',
    description: 'Città antica scavata nella roccia, meraviglia archeologica.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'culture',
    coordinates: { lat: 30.3285, lng: 35.4444 },
    bestTimeToVisit: ['Marzo', 'Aprile', 'Maggio', 'Ottobre', 'Novembre'],
    duration: '2-4 giorni',
    activities: [
      {
        id: '9-1',
        name: 'Il Tesoro',
        description: 'Ammira la facciata più famosa di Petra',
        icon: '🏛️',
        duration: '2 ore'
      },
      {
        id: '9-2',
        name: 'Monastero',
        description: 'Sali al monumentale monastero',
        icon: '⛰️',
        duration: '4 ore'
      }
    ]
  },
  {
    id: '10',
    name: 'Serengeti',
    country: 'Tanzania',
    continent: 'Africa',
    description: 'Safari nell\'ecosistema più famoso dell\'Africa.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop'
    ],
    budget: 'high',
    type: 'nature',
    coordinates: { lat: -2.3333, lng: 34.8333 },
    bestTimeToVisit: ['Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre'],
    duration: '4-7 giorni',
    activities: [
      {
        id: '10-1',
        name: 'Grande Migrazione',
        description: 'Assisti al fenomeno naturale più spettacolare',
        icon: '🦓',
        duration: '8 ore',
        price: 300
      },
      {
        id: '10-2',
        name: 'Safari in mongolfiera',
        description: 'Vola sopra la savana al tramonto',
        icon: '🎈',
        duration: '3 ore',
        price: 500
      }
    ]
  },
  {
    id: '11',
    name: 'Kyoto',
    country: 'Giappone',
    continent: 'Asia',
    description: 'Antica capitale con templi, giardini zen e tradizioni millenarie.',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop'
    ],
    budget: 'high',
    type: 'culture',
    coordinates: { lat: 35.0116, lng: 135.7681 },
    bestTimeToVisit: ['Marzo', 'Aprile', 'Maggio', 'Ottobre', 'Novembre'],
    duration: '4-6 giorni',
    activities: [
      {
        id: '11-1',
        name: 'Fushimi Inari',
        description: 'Cammina tra migliaia di torii rossi',
        icon: '⛩️',
        duration: '3 ore'
      },
      {
        id: '11-2',
        name: 'Cerimonia del tè',
        description: 'Partecipa alla tradizionale cerimonia',
        icon: '🍵',
        duration: '2 ore',
        price: 50
      }
    ]
  },
  {
    id: '12',
    name: 'Banff',
    country: 'Canada',
    continent: 'North America',
    description: 'Parco nazionale con laghi turchesi e montagne mozzafiato.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'mountain',
    coordinates: { lat: 51.4968, lng: -115.9281 },
    bestTimeToVisit: ['Giugno', 'Luglio', 'Agosto', 'Settembre'],
    duration: '5-8 giorni',
    activities: [
      {
        id: '12-1',
        name: 'Lago Louise',
        description: 'Ammira il lago color smeraldo',
        icon: '🏔️',
        duration: '2 ore'
      },
      {
        id: '12-2',
        name: 'Trekking Icefield',
        description: 'Esplora i ghiacciai delle Montagne Rocciose',
        icon: '🥾',
        duration: '6 ore',
        price: 180
      }
    ]
  },
  {
    id: '13',
    name: 'Toscana',
    country: 'Italia',
    continent: 'Europe',
    description: 'Colline ondulate, vigneti e borghi medievali nel cuore d\'Italia.',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'countryside',
    coordinates: { lat: 43.7711, lng: 11.2486 },
    bestTimeToVisit: ['Aprile', 'Maggio', 'Giugno', 'Settembre', 'Ottobre'],
    duration: '5-10 giorni',
    activities: [
      {
        id: '13-1',
        name: 'Tour dei vini Chianti',
        description: 'Degusta i famosi vini toscani',
        icon: '🍷',
        duration: '6 ore',
        price: 120
      },
      {
        id: '13-2',
        name: 'San Gimignano',
        description: 'Visita la città delle torri medievali',
        icon: '🏰',
        duration: '4 ore'
      },
      {
        id: '13-3',
        name: 'Cooking class',
        description: 'Impara a cucinare i piatti tradizionali',
        icon: '👨‍🍳',
        duration: '3 ore',
        price: 80
      }
    ]
  },
  {
    id: '14',
    name: 'Roma',
    country: 'Italia',
    continent: 'Europe',
    description: 'La Città Eterna con duemila anni di storia, arte e cultura immortale.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197040d963?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1552832230-c0197040d963?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'culture',
    coordinates: { lat: 41.9028, lng: 12.4964 },
    bestTimeToVisit: ['Aprile', 'Maggio', 'Giugno', 'Settembre', 'Ottobre'],
    duration: '4-7 giorni',
    activities: [
      {
        id: '14-1',
        name: 'Colosseo',
        description: 'Visita l\'anfiteatro più famoso del mondo',
        icon: '🏛️',
        duration: '2 ore',
        price: 16
      },
      {
        id: '14-2',
        name: 'Musei Vaticani',
        description: 'Ammira la Cappella Sistina e le opere d\'arte',
        icon: '🎨',
        duration: '3 ore',
        price: 20
      },
      {
        id: '14-3',
        name: 'Fontana di Trevi',
        description: 'Lancia una moneta nella fontana più famosa',
        icon: '⛲',
        duration: '1 ora'
      },
      {
        id: '14-4',
        name: 'Foro Romano',
        description: 'Cammina nel cuore dell\'antica Roma',
        icon: '🏺',
        duration: '2 ore',
        price: 12
      }
    ]
  },
  {
    id: '15',
    name: 'Vienna',
    country: 'Austria',
    continent: 'Europe',
    description: 'Capitale imperiale con palazzi barocchi, caffè storici e tradizione musicale straordinaria.',
    image: 'https://images.unsplash.com/photo-1516550893923-42d407bd4147?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516550893923-42d407bd4147?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    budget: 'medium',
    type: 'culture',
    coordinates: { lat: 48.2082, lng: 16.3738 },
    bestTimeToVisit: ['Aprile', 'Maggio', 'Giugno', 'Settembre', 'Ottobre'],
    duration: '3-5 giorni',
    activities: [
      {
        id: '15-1',
        name: 'Palazzo di Schönbrunn',
        description: 'Visita la residenza estiva degli imperatori asburgo',
        icon: '🏰',
        duration: '3 ore',
        price: 22
      },
      {
        id: '15-2',
        name: 'Centro storico di Vienna',
        description: 'Passeggia tra architettura barocca e caffè storici',
        icon: '🏛️',
        duration: '4 ore'
      },
      {
        id: '15-3',
        name: 'Concerto di musica classica',
        description: 'Ascolta Mozart e Strauss nella città della musica',
        icon: '�',
        duration: '2 ore',
        price: 35
      },
      {
        id: '15-4',
        name: 'Mercatini di Natale',
        description: 'Visita i famosi mercatini natalizi (dicembre)',
        icon: '�',
        duration: '2 ore'
      }
    ]
  }
];