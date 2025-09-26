import { NextRequest, NextResponse } from 'next/server';
import { destinations } from '@/data/destinations';

export async function GET(request: NextRequest) {
  const cityName = request.nextUrl.searchParams.get('city');
  
  if (!cityName) {
    return NextResponse.json({ error: 'City name required' }, { status: 400 });
  }

  try {
  // Leggi coordinate opzionali e prepara il titolo di query
    let lat = request.nextUrl.searchParams.get('lat');
    let lon = request.nextUrl.searchParams.get('lon');
    let queryTitle = cityName;
    const GEO_KEY = process.env.GEOAPIFY_API_KEY;

  // Se non sono fornite coordinate ma abbiamo la chiave Geoapify, prova il forward geocoding per disambiguare il nome della città
    if ((!lat || !lon) && GEO_KEY) {
      try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&limit=6&format=json&apiKey=${encodeURIComponent(GEO_KEY)}`;
        const geoResp = await fetch(geoUrl);
        if (geoResp.ok) {
          const geo = await geoResp.json();
          const feats = geo?.features || [];
          // Preferisci feature che sembrano luoghi abitati (city, town, village, municipality)
          const placeFeature = feats.find((f: any) => {
            const p = f?.properties || {};
            const join = JSON.stringify(p).toLowerCase();
            return /city|town|village|municipality|locality|comune|capoluogo/.test(join);
          }) || feats[0];

          if (placeFeature) {
            const candidate = placeFeature?.properties?.name || placeFeature?.properties?.formatted;
            if (candidate) queryTitle = candidate;
            // se la feature ha una geometry, usa le sue coordinate come suggerimento per la selezione dell'immagine
            const coords = placeFeature?.geometry?.coordinates;
            if (coords && coords.length >= 2) {
              lon = String(coords[0]);
              lat = String(coords[1]);
            }
          }
        }
      } catch (err) {
        // ignora eventuali errori del forward geocoding e continua
      }
    }

  // Se lat/lon sono state fornite esplicitamente, prova a disambiguare usando il reverse geocoding di Geoapify (se la API key è disponibile)
    if (lat && lon && GEO_KEY) {
      try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&apiKey=${encodeURIComponent(GEO_KEY)}`;
        const geoResp = await fetch(geoUrl);
        if (geoResp.ok) {
          const geo = await geoResp.json();
          const feat = geo?.features?.[0];
          const candidate = feat?.properties?.name || feat?.properties?.formatted || feat?.properties?.city || feat?.properties?.town;
          if (candidate) queryTitle = candidate;
        }
      } catch (err) {
        // ignora l'errore e fai fallback al nome della città
      }
    }

  // Step 1: prova l'endpoint summary di Wikipedia in italiano per una pagina esatta usando il titolo disambiguato, fallback in inglese
    const summaryUrlIt = `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryTitle)}`;
    const summaryUrlEn = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryTitle)}`;
    let usedLang: 'it' | 'en' = 'it';
    let searchResponse = await fetch(summaryUrlIt);
    if (!searchResponse.ok) {
      // prova l'inglese come fallback
      searchResponse = await fetch(summaryUrlEn);
      usedLang = 'en';
    }
    let searchData: any = null;

  // Se l'endpoint summary restituisce 404, prova l'endpoint di ricerca per trovare un titolo corrispondente
    if (searchResponse.status === 404) {
      // Preferisci la ricerca nella lingua usata; se necessario esegui il fallback alla ricerca in inglese
      const searchHost = usedLang === 'it' ? 'it.wikipedia.org' : 'en.wikipedia.org';
      const searchApi = `https://${searchHost}/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(cityName)}&origin=*`;
      const searchApiResp = await fetch(searchApi);
      if (searchApiResp.ok) {
        const searchApiData = await searchApiResp.json();
        const allResults = searchApiData?.query?.search || [];

  // Preferisci risultati il cui snippet indica una pagina di tipo luogo/città
        const placeKeywords = ['città', 'comune', 'city', 'town', 'municipality', 'metropoli', 'capoluogo', 'popolazione'];
        let chosenTitle: string | null = null;

        for (const r of allResults) {
          const snippet = String(r.snippet || '').toLowerCase();
          for (const kw of placeKeywords) {
            if (snippet.includes(kw)) {
              chosenTitle = r.title;
              break;
            }
          }
          if (chosenTitle) break;
        }

  // Fallback al primo risultato se nessuno corrisponde chiaramente a una pagina di luogo
        const first = allResults[0];
        if (!chosenTitle && first && first.title) chosenTitle = first.title;

        if (chosenTitle) {
          const title = chosenTitle;
          // recupera il summary nella stessa lingua della ricerca
          searchResponse = await fetch(`https://${searchHost}/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
          usedLang = searchHost.startsWith('it.') ? 'it' : 'en';
        }
      }
    }

    if (searchResponse.ok) {
      searchData = await searchResponse.json();
    }
    
  // Controlla se disponiamo di una thumbnail
  // Prova a ottenere un estratto più lungo (più contenuto) dall'API di Wikipedia
    let longExtract: string | null = null;
    try {
      // Prova a estrarre un testo più lungo da Wikipedia in italiano prima; altrimenti esegui il fallback all'inglese
      const title = searchData?.title || cityName;
      const extractApiIt = `https://it.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&exchars=2000&titles=${encodeURIComponent(
        title
      )}&origin=*`;
      const extractApiEn = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&exchars=2000&titles=${encodeURIComponent(
        title
      )}&origin=*`;
      let extractResp = await fetch(extractApiIt);
      if (!extractResp.ok) extractResp = await fetch(extractApiEn);
      if (extractResp.ok) {
        const extractData = await extractResp.json();
        const pages = extractData?.query?.pages;
        const firstKey = pages && Object.keys(pages)[0];
        longExtract = pages?.[firstKey]?.extract || null;
      }
    } catch (e) {
  // ignora i fallimenti dell'estrazione
    }

    // Prepara la mappa di landmark (estratta in alto in modo che anche la fallback media-list ne benefici)
  // Normalizza pageTitle: rimuovi disambiguazioni tra parentesi come 'Rome (disambiguation)'
  let pageTitleRaw = searchData?.title || cityName;
  const pageTitle = String(pageTitleRaw).replace(/\s*\([^)]*\)\s*/g, '').trim();
    const LANDMARKS: Record<string, string[]> = {
      roma: ['Colosseo', 'Colosseum', 'Pantheon', 'Foro Romano', 'Basilica di San Pietro', 'Piazza Navona'],
      rome: ['Colosseum', 'Pantheon', 'Roman Forum', 'St Peter', "St Peter's Basilica", 'Piazza Navona'],
      parigi: ['Torre Eiffel', 'Tour Eiffel', 'Louvre', 'Notre-Dame', 'Montmartre'],
      paris: ['Eiffel Tower', 'Louvre', 'Notre-Dame', 'Montmartre'],
      londra: ['Big Ben', 'Tower Bridge', 'London Eye', 'Buckingham Palace'],
      london: ['Big Ben', 'Tower Bridge', 'London Eye', 'Buckingham Palace'],
      firenze: ['Duomo di Firenze', 'Cathedral of Santa Maria del Fiore', 'Ponte Vecchio', 'Piazza della Signoria', 'Cupola del Brunelleschi'],
      florence: ['Duomo di Firenze', 'Florence Cathedral', 'Ponte Vecchio', 'Uffizi', 'Piazza della Signoria', 'Brunelleschi Dome'],
      venezia: ['Piazza San Marco', 'St Mark', 'Grand Canal', 'Ponte di Rialto'],
      venice: ['St Mark', 'Piazza San Marco', 'Rialto Bridge', 'Grand Canal'],
      milano: ['Duomo di Milano', 'Duomo', 'Galleria Vittorio Emanuele II', 'Castello Sforzesco'],
      milan: ['Duomo', 'Galleria Vittorio Emanuele II', 'Sforza Castle'],
      barcellona: ['Sagrada Familia', 'Park Guell', 'La Rambla'],
      barcelona: ['Sagrada Familia', 'Park Guell', 'La Rambla'],
      praga: ['Castello di Praga', 'Charles Bridge', 'Piazza della Città Vecchia'],
      prague: ['Prague Castle', 'Charles Bridge', 'Old Town Square'],
      amsterdam: ['Canals of Amsterdam', 'Rijksmuseum', 'Anne Frank House'],
      lisbona: ['Torre di Belem', 'Ponte 25 de Abril', 'Alfama'],
      lisbon: ['Belem Tower', '25 de Abril Bridge', 'Alfama'],
      'rio de janeiro': ['Cristo Redentor', 'Christ the Redeemer', 'Sugarloaf Mountain', 'Copacabana', 'Ipanema'],
      rio: ['Cristo Redentor', 'Christ the Redeemer', 'Sugarloaf Mountain', 'Copacabana', 'Ipanema'],
      kyoto: ['Fushimi Inari', 'Golden Pavilion', 'Kinkaku-ji', 'Bamboo Grove', 'Gion District'],
      'hong kong': ['Victoria Peak', 'Victoria Harbour', 'Hong Kong skyline', 'Central District', 'Symphony of Lights', 'Star Ferry', 'Tsim Sha Tsui', 'IFC Tower'],
      'gold coast': ['Surfers Paradise', 'SkyPoint', 'Gold Coast skyline', 'Q1 Tower'],
      atene: ['Acropoli', 'Partenone', 'Acropolis', 'Parthenon', 'Plaka'],
      athens: ['Acropolis', 'Parthenon', 'Plaka', 'Temple of Zeus'],
      assisi: ['Basilica di San Francesco', 'Basilica of Saint Francis', 'Rocca Maggiore'],
      ravenna: ['Basilica di San Vitale', 'Mausoleo di Galla Placidia', 'Basilica di Sant Apollinare'],
      maldive: ['resort', 'bungalow', 'lagoon', 'coral', 'atoll', 'beach resort'],
      maldives: ['resort', 'bungalow', 'lagoon', 'coral', 'atoll', 'beach resort'],
      zermatt: ['Matterhorn', 'Gornergrat', 'Klein Matterhorn', 'village', 'alpine village', 'mountain village'],
    };

    const normalize = (s = '') => String(s).toLowerCase();
    const keyGuess = Object.keys(LANDMARKS).find(k => normalize(pageTitle).includes(k) || normalize(cityName).includes(k));
    const landmarks = keyGuess ? LANDMARKS[keyGuess] : [];

  // Verifica che la pagina Wikipedia trovata sia effettivamente un luogo (city/town). Se no, scarta la descrizione wiki per evitare contenuti non correlati
    try {
      const wikiHost = usedLang === 'it' ? 'it.wikipedia.org' : 'en.wikipedia.org';
      // isWikipediaPagePlace è definita più avanti in questo file
      // Se la pagina non rappresenta un luogo, proviamo a trovare una pagina "parent" più generica
      // (es: 'Comuna 6' -> cerca la città/metropoli correlata) usando la ricerca di Wikipedia.
      // Questo aiuta casi come 'comuna 6' che altrimenti restituiscono immagini non rappresentative.
      // eslint-disable-next-line no-await-in-loop
      const pageIsPlace = await isWikipediaPagePlace(pageTitle, wikiHost);
      if (!pageIsPlace) {
        console.debug('[city-images] wikipedia page is not a place, trying to find parent place for', pageTitle);
        try {
          // Cerca una pagina 'parent' usando la API di ricerca di Wikipedia e verifica con isWikipediaPagePlace
          async function findParentPlace(name: string, host: string) {
            try {
              const searchHost = host;
              const placeHints = ['città', 'comune', 'city', 'town', 'municipio', 'municipality', 'capoluogo'];
              const sr = `${name} ${placeHints.join(' ')}`;
              const searchApi = `https://${searchHost}/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(sr)}&origin=*`;
              const resp = await fetch(searchApi);
              if (!resp.ok) return null;
              const data = await resp.json();
              const results = data?.query?.search || [];
              for (const r of results) {
                const title = r?.title;
                if (!title) continue;
                try {
                  const isPlaceCandidate = await isWikipediaPagePlace(title, searchHost);
                  if (isPlaceCandidate) return title;
                } catch (e) {
                  // ignora singoli fallimenti
                }
              }
              // fallback: ritorna il primo risultato non vuoto
              return results[0]?.title || null;
            } catch (e) {
              return null;
            }
          }

          const parent = await findParentPlace(pageTitle || cityName, usedLang === 'it' ? 'it.wikipedia.org' : 'en.wikipedia.org');
          if (parent) {
            const parentResp = await fetch(`https://${usedLang === 'it' ? 'it.wikipedia.org' : 'en.wikipedia.org'}/api/rest_v1/page/summary/${encodeURIComponent(parent)}`);
            if (parentResp.ok) {
              searchResponse = parentResp;
              searchData = await searchResponse.json();
              // aggiorna pageTitleRaw per continuare le heuristics con il titolo più coerente
              pageTitleRaw = searchData?.title || pageTitleRaw;
            } else {
              // non abbiamo trovato un parent valido, scarta i dati wiki
              console.debug('[city-images] no parent place found, ignoring wiki extract for', pageTitle);
              searchData = null;
              longExtract = null;
            }
          } else {
            console.debug('[city-images] parent place search returned nothing for', pageTitle);
            searchData = null;
            longExtract = null;
          }
        } catch (e) {
          // se qualcosa va storto, scarta i dati wiki e continua
          searchData = null;
          longExtract = null;
        }
      }
    } catch (e) {
      // ignora e continua
    }

  // Helper: estrai frasi candidate di landmark da un estratto di Wikipedia.
  // Euristica semplice: cattura sequenze di parole capitalizzate e filtra per lunghezza/frequenza.
    function extractLandmarksFromText(text: string) {
      if (!text || text.length < 50) return [];
      // remove parentheses content and short parentheses
      const cleaned = text.replace(/\([^)]*\)/g, ' ');
      // match sequences of capitalized words (works reasonably for Italian/English titles)
      const re = /(?:\b[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ]+(?:\s+[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ]+){0,4})/g;
      const matches = cleaned.match(re) || [];
      const freq: Record<string, number> = {};
      for (const m of matches) {
        const s = m.trim();
        if (s.length < 4) continue;
  // ignora le parole iniziali ovvie che non sono landmark
        if (/^(The|A|An|Il|La|Le|Lo|I|Gli|Una|Un)\b/.test(s)) continue;
        freq[s] = (freq[s] || 0) + 1;
      }
      // sort by frequency and length
      const candidates = Object.keys(freq).sort((a, b) => (freq[b] - freq[a]) || (b.length - a.length));
      return candidates.slice(0, 6);
    }

  // Preferisci Unsplash per le foto della città quando è configurata una access key.
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (UNSPLASH_KEY) {
      try {
  // (landmarks è definito sopra)

  // Costruisci query prioritarie: prova prima query focalizzate sui landmark
        const queries: string[] = [];
        if (landmarks.length) {
          // Monument-first: prova prima i nomi dei landmark da soli, poi combinati con il nome della città
          for (const lm of landmarks) {
            queries.push(`${lm}`); // e.g. 'Colosseo'
            queries.push(`${pageTitle} ${lm}`);
            queries.push(`${lm} ${pageTitle}`);
          }
          // also include a combined query with multiple landmarks to bias results
          queries.push(`${landmarks.slice(0, 2).join(' ')}`);
          queries.push(`${pageTitle} ${landmarks.slice(0, 2).join(' ')}`);
          queries.push(`${pageTitle} skyline city`);
        } else {
          queries.push(`${pageTitle} skyline city`);
          queries.push(`${pageTitle} cityscape`);
        }

        let results: any[] = [];
  // Se non abbiamo landmark statici, prova ad estrarre frasi simili a landmark da longExtract (Wikipedia)
        if (!landmarks.length && longExtract) {
          try {
            const auto = extractLandmarksFromText(longExtract);
            if (auto && auto.length) {
              // usa frasi con iniziale maiuscola come pseudo-landmark
              for (const a of auto) {
                queries.push(a);
                queries.push(`${pageTitle} ${a}`);
              }
            }
          } catch (e) {
            // ignora
          }
        }

  // Prova le query in ordine; fermati alla prima che restituisce risultati
        for (const q of queries) {
          const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=8&orientation=landscape`;
          const uResp = await fetch(unsplashUrl, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } });
          if (!uResp.ok) continue;
          const uData = await uResp.json();
          results = Array.isArray(uData?.results) ? uData.results : [];
          if (results.length) break;
        }

  // Valuta i candidati: preferisci quelli che menzionano la città o parole chiave dei landmark in location/title/alt_description o che hanno tag legati alla città
        const cityLower = (pageTitle || cityName).toLowerCase();
        const cityTags = ['city', 'skyline', 'cityscape', 'panorama', 'view', 'downtown', 'piazza', 'urban'];
        const landmarkKeywords = landmarks.map(l => normalize(l));
        let best: any = null;
        let bestScore = -Infinity;

  for (const photo of results) {
          let score = 0;
          const alt = String(photo?.alt_description || '').toLowerCase();
          const desc = String(photo?.description || '').toLowerCase();
          const loc = String(photo?.location?.title || '').toLowerCase();
          const tags = (photo?.tags || []).map((t: any) => String(t.title || '').toLowerCase());

          // Blacklist lato server: filtra soggetti evidentemente irrilevanti 
          const blacklisted = [
            // Animali e natura non urbana
            'gull', 'seagull', 'bird', 'dog', 'cat', 'puppy', 'pet', 'animal', 'wildlife', 'fish', 'butterfly', 'insect',
            'gabbiano', 'gabbiani', 'uccello', 'uccelli', 'cane', 'gatto', 'animale', 'farfalla', 'insetto',
            // Persone e ritratti
            'portrait', 'face', 'selfie', 'person', 'people', 'man', 'woman', 'child', 'baby', 'crowd', 'tourist',
            'persona', 'persone', 'uomo', 'donna', 'bambino', 'bambina', 'folla', 'turista', 'ritratto', 'viso',
            // Cibo e oggetti
            'food', 'meal', 'dish', 'plate', 'restaurant', 'cafe', 'bar', 'drink', 'coffee', 'wine', 'beer',
            'cibo', 'piatto', 'ristorante', 'caffe', 'vino', 'birra', 'bevanda', 'pranzo', 'cena',
            // Interni e oggetti
            'interior', 'room', 'bedroom', 'kitchen', 'bathroom', 'furniture', 'chair', 'table', 'bed',
            'interno', 'stanza', 'camera', 'cucina', 'bagno', 'mobile', 'sedia', 'tavolo', 'letto',
            // Oggetti vari
            'car', 'vehicle', 'bike', 'motorcycle', 'train', 'plane', 'boat', 'ship', 'close-up', 'macro',
            'auto', 'macchina', 'bicicletta', 'moto', 'treno', 'aereo', 'barca', 'nave', 'primo piano',
            // Natura non urbana
            'flower', 'tree', 'forest', 'mountain', 'beach', 'ocean', 'sea', 'lake', 'river', 'sunset', 'sunrise',
            'fiore', 'albero', 'bosco', 'montagna', 'spiaggia', 'oceano', 'mare', 'lago', 'fiume', 'tramonto', 'alba',
            // Oggetti di consumo
            'shopping', 'shop', 'store', 'market', 'vendor', 'product', 'souvenir', 'gift',
            'negozio', 'mercato', 'venditore', 'prodotto', 'souvenir', 'regalo',
            // Abbigliamento e accessori
            'shoes', 'shoe', 'sneakers', 'boots', 'clothing', 'clothes', 'fashion', 'outfit',
            'scarpe', 'scarpa', 'sneaker', 'stivali', 'abbigliamento', 'vestiti', 'moda'
          ];
          // Evita immagini di stadi, arene e eventi sportivi che spesso non rappresentano la città
          const sportsBlacklist = [
            'stadium', 'stadione', 'arena', 'stadiums', 'stadion', 'soccer', 'football', 'futbol', 'match', 'game', 'goal', 'kickoff', 'sports', 'crowd'
          ];
          
          // Blacklist specifica per città che vengono spesso confuse
          const citySpecificBlacklist: {[key: string]: string[]} = {
            'firenze': ['milan', 'milano', 'duomo di milano', 'cathedral of milan'],
            'florence': ['milan', 'milano', 'duomo di milano', 'cathedral of milan'],
            'milano': ['firenze', 'florence', 'duomo di firenze', 'florence cathedral'],
            'milan': ['firenze', 'florence', 'duomo di firenze', 'florence cathedral'],
            'rio de janeiro': ['rio grande', 'rio negro', 'amazon', 'jungle', 'carnival mask', 'samba dancer'],
            'rio': ['rio grande', 'rio negro', 'amazon', 'jungle', 'carnival mask', 'samba dancer'],
            'kyoto': ['tokyo', 'osaka', 'mount fuji', 'tokyo tower', 'shibuya'],
            'hong kong': ['singapore', 'shanghai', 'beijing', 'taipei', 'macau', 'shoes', 'shoe', 'sneakers', 'shopping', 'fashion', 'store', 'market'],
            'gold coast': ['sydney', 'melbourne', 'brisbane', 'perth', 'cairns'],
            'atene': ['santorini', 'mykonos', 'thessaloniki', 'crete', 'rhodes'],
            'athens': ['santorini', 'mykonos', 'thessaloniki', 'crete', 'rhodes'],
            'assisi': ['rome', 'florence', 'siena', 'pisa', 'vatican'],
            'ravenna': ['venice', 'bologna', 'florence', 'rome', 'milan'],
            'maldive': ['satellite', 'aerial view', 'bird view', 'overhead', 'from above', 'satellitare', 'vista aerea'],
            'maldives': ['satellite', 'aerial view', 'bird view', 'overhead', 'from above'],
            'zermatt': ['leaves', 'leaf', 'foglie', 'foglia', 'close-up', 'closeup', 'detail', 'macro']
          };

          let isBlacklisted = false;
          try {
            // Blacklist generale
            for (const b of blacklisted) {
              if (alt.includes(b) || desc.includes(b) || loc.includes(b) || tags.some((t: string) => t.includes(b))) {
                isBlacklisted = true;
                break;
              }
            }
            // Blacklist per immagini sportive/stadio
            if (!isBlacklisted) {
              for (const sb of sportsBlacklist) {
                if (alt.includes(sb) || desc.includes(sb) || loc.includes(sb) || tags.some((t: string) => t.includes(sb))) {
                  isBlacklisted = true;
                  break;
                }
              }
            }
            
            // Blacklist specifica per città
            const cityBlacklist = citySpecificBlacklist[cityLower] || [];
            for (const b of cityBlacklist) {
              if (alt.includes(b) || desc.includes(b) || loc.includes(b) || tags.some((t: string) => t.includes(b))) {
                isBlacklisted = true;
                break;
              }
            }
          } catch (e) {
            // ignora
          }
          if (isBlacklisted) {
            // salta in anticipo foto chiaramente irrilevanti
            continue;
          }

          // Corrispondenze città/landmark
          if (alt.includes(cityLower) || desc.includes(cityLower)) score += 50;
          if (loc && loc.includes(cityLower)) score += 60;
          
          // Boost significativo per termini che indicano paesaggi urbani/architettura
          const urbanKeywords = ['skyline', 'cityscape', 'architecture', 'building', 'buildings', 'downtown', 'center', 'centre', 'plaza', 'square', 'street', 'avenue', 'bridge', 'tower', 'cathedral', 'church', 'palace', 'castle', 'monument', 'landmark', 'panorama', 'view', 'aerial', 'harbor', 'port'];
          const urbanKeywordsIt = ['skyline', 'panorama', 'architettura', 'edificio', 'edifici', 'centro', 'piazza', 'via', 'ponte', 'torre', 'cattedrale', 'chiesa', 'palazzo', 'castello', 'monumento', 'vista', 'aereo', 'porto'];
          
          for (const uk of [...urbanKeywords, ...urbanKeywordsIt]) {
            if (alt.includes(uk) || desc.includes(uk)) score += 40;
            if (loc && loc.includes(uk)) score += 50;
            if (tags.some((t: string) => t.includes(uk))) score += 35;
          }
          
          for (const t of tags) {
            if (t.includes(cityLower)) score += 30;
            for (const ct of cityTags) if (t.includes(ct)) score += 10;
          }
          for (const ct of cityTags) {
            if (alt.includes(ct) || desc.includes(ct)) score += 8;
          }

          // Forte boost quando le parole chiave dei landmark compaiono in alt/desc/loc/tags
          for (const lk of landmarkKeywords) {
            if (!lk) continue;
            if (alt.includes(lk) || desc.includes(lk)) score += 80;
            if (loc.includes(lk)) score += 100;
            if (tags.some((t: string) => t.includes(lk))) score += 60;
          }
          
          // Penalizza fortemente le immagini che sembrano non essere paesaggi urbani/monumenti
          const inappropriatePatterns = [
            // Primi piani e dettagli
            'close-up', 'closeup', 'detail', 'macro', 'zoom', 'leaves', 'leaf', 'foglie', 'foglia',
            // Oggetti singoli
            'single', 'isolated', 'white background', 'studio shot',
            // Natura non urbana
            'forest', 'jungle', 'wilderness', 'rural', 'countryside', 'farm',
            // Interni
            'indoor', 'inside', 'interior',
            // Viste aeree/satellitari inappropriate
            'satellite', 'aerial view', 'bird view', 'overhead', 'from above', 'satellitare', 'vista aerea'
          ];
          
          for (const pattern of inappropriatePatterns) {
            if (alt.includes(pattern) || desc.includes(pattern)) score -= 30;
            if (tags.some((t: string) => t.includes(pattern))) score -= 25;
          }

          // Penalizza fortemente immagini che sembrano riferirsi a stadi o eventi sportivi
          const stadiumPatterns = ['stadium', 'stadione', 'arena', 'match', 'soccer', 'football', 'futbol', 'stadiums', 'footballmatch'];
          for (const sp of stadiumPatterns) {
            if (alt.includes(sp) || desc.includes(sp) || loc.includes(sp) || tags.some((t: string) => t.includes(sp))) score -= 200;
          }

          // piccolo incremento per maggior numero di like/popolarità
          score += (photo?.likes || 0) * 0.01;

          const cand = photo?.urls?.regular || photo?.urls?.full || photo?.urls?.raw;
          if (!cand) continue;

          // skip candidate if already used elsewhere
          if (isAlreadyUsed(cand)) continue;

          // Penalizza placeholder evidenti da estensione del file o pattern di percorso noti
          const lc = String(cand).toLowerCase();
          if (lc.endsWith('.svg') || lc.includes('/flag_') || lc.includes('coat_of_arms')) score -= 100;

          if (score > bestScore) {
            bestScore = score;
            best = { photo, cand, score };
          }
        }

  if (best && best.cand) {
          const content = (longExtract || searchData?.extract || '')?.toLowerCase() || '';
          const activities = generateActivitiesFromText(content);
          console.debug('[city-images] selected unsplash photo', { city: pageTitle, cand: best.cand, score: best.score, alt: best.photo?.alt_description, location: best.photo?.location?.title });
          // mark the returned image as used to avoid duplicates across requests
          markUsed(best.cand);
          return NextResponse.json({
            imageUrl: best.cand,
            // preferisci la descrizione alt della foto ma fai fallback al titolo wiki localizzato
            title: best.photo?.alt_description || (usedLang === 'it' ? searchData?.title : searchData?.title) || pageTitle,
                    description: chooseDescription(searchData?.extract, cityName as string),
            longExtract,
            activities,
              source: 'unsplash',
            lang: usedLang
          });
        }
      } catch (err) {
        // ignora errori Unsplash e continua con Wikipedia
      }
    }

    if (searchData && searchData.thumbnail && searchData.thumbnail.source) {
      // Filtraggio più aggressivo per evitare bandiere, loghi, stemmi o simboli amministrativi
      const thumbSrc = String(searchData.thumbnail.source || '').toLowerCase();
      const thumbTitle = String(searchData.title || '').toLowerCase();
      
  // Pattern migliorati per catturare più variazioni di bandiere/loghi
      const badImagePattern = /flag|bandiera|bandera|flagge|drapeau|coat_of_arms|coat-of-arms|logo|seal|emblem|stemma|crest|arms|heraldic|municipal|city_flag|locator|map|symbol|badge|insignia/;
      const badTitlePattern = /flag|bandiera|bandera|flagge|drapeau|coat|arms|emblem|stemma|seal|logo|crest|heraldic|municipal|symbol|badge|insignia/;
      
      let acceptThumb = true;
      try {
        if (badImagePattern.test(thumbSrc) || badTitlePattern.test(thumbTitle)) {
          acceptThumb = false;
        }
      } catch (e) {
        // ignora e consenti la thumbnail
      }

  if (acceptThumb) {
  // Ottieni la versione ad alta risoluzione modificando l'URL
        const imageUrl = searchData.thumbnail.source.replace(/\/\d+px-/, '/800px-');

  // Validazione HEAD rapida: assicurati che sia un'immagine, non SVG, e non troppo piccola (evita icone/bandiere)
        try {
          const headResp = await fetch(imageUrl, { method: 'HEAD' });
          const ct = String(headResp.headers.get('content-type') || '').toLowerCase();
          const cl = Number(headResp.headers.get('content-length') || '0');
          const badUrlPatternLocal = /\/flag[_-]|flag_of_|coat_of_arms|coat-of-arms|logo|seal|symbol|insignia|badge|chart|graph|diagram|screenshot/i;
          if (ct.startsWith('image/') && !ct.includes('svg') && cl > 10000 && !badUrlPatternLocal.test(String(imageUrl).toLowerCase())) {
            // Costruisci activities e euristiche basate sull'eventuale longExtract in italiano
            const content = (longExtract || searchData.extract || '').toLowerCase();
            const activities = generateActivitiesFromText(content);

            console.debug('[city-images] returning wikipedia thumbnail', { title: searchData.title, imageUrl });
            // avoid duplicates
            if (isAlreadyUsed(imageUrl)) {
              // if already used, don't return it; fallthrough to media-list
            } else {
              markUsed(imageUrl);
              return NextResponse.json({
                imageUrl,
              title: searchData.title,
              description: chooseDescription(searchData.extract, cityName as string),
              longExtract,
              activities,
              source: 'wikipedia',
              lang: usedLang
              });
            }
          }
          } catch (err) {
          // se HEAD fallisce, non accettare la thumbnail (passa al media-list)
        }
      }
      // altrimenti prosegui con il lookup della media-list della pagina
    }

  // Fallback: prova a ottenere immagini dalla pagina
  // Usa lo stesso host linguistico usato per il summary per recuperare la media list (preferisci Italiano se disponibile)
    const wikiHost = usedLang === 'it' ? 'it.wikipedia.org' : 'en.wikipedia.org';
    const imagesUrl = `https://${wikiHost}/api/rest_v1/page/media-list/${encodeURIComponent(pageTitle)}`;
    const imagesResponse = await fetch(imagesUrl);
    
      if (imagesResponse.ok) {
      const imagesData = await imagesResponse.json();
      
  // Filtraggio avanzato per gli elementi media - evita bandiere, loghi, mappe, simboli amministrativi
      const items = imagesData.items || [];
  // Titoli/URLs che indicano fortemente che l'elemento multimediale non è un'immagine fotografica della città
  const badTitle = /flag|bandiera|bandera|flagge|drapeau|coat_of_arms|coat-of-arms|coat|arms|logo|seal|emblem|stemma|crest|heraldic|municipal|city_flag|locator|map|symbol|badge|insignia|administrative|official|chart|graph|diagram|population|statistics|statistic|table|screenshot|infographic|poster|diagramma|grafico|grafici/i;
  const badUrlPattern = /\/flag[_-]|flag_of_|\/thumb\/.*Flag|coat_of_arms|coat-of-arms|logo|seal|symbol|insignia|badge|chart|graph|diagram|population|stats|statistic|histogram|bar_chart|diagramma|grafico|screenshot|poster/i;
      let chosenUrl: string | null = null;
      
  // Primo passaggio: cerca immagini landscape/cityscape di buona qualità
      for (const item of items) {
        if (!item || item.type !== 'image') continue;
        const title = String(item.title || '').toLowerCase();
        if (title.endsWith('.svg')) continue;
        if (badTitle.test(title)) continue;

        const origSrc = String(item.original?.source || '').toLowerCase();
        const thumbSrcItem = String(item.thumbnail?.source || '').toLowerCase();
        if (badUrlPattern.test(origSrc) || badUrlPattern.test(thumbSrcItem)) continue;

  // Preferisci immagini che indicano cityscapes, paesaggi o vedute generali
        const goodImagePattern = /skyline|panorama|view|landscape|cityscape|street|piazza|downtown|centro|vista|veduta|harbor|port|river|riverside|mountain|montagna/i;
        const isGoodImage = goodImagePattern.test(title) || goodImagePattern.test(origSrc) || goodImagePattern.test(thumbSrcItem);

  // Boost per monumenti: se il titolo o la source dell'item menziona uno dei landmark conosciuti, preferiscilo fortemente
        let monumentBoost = 0;
        try {
          for (const lm of landmarks) {
            const lk = String(lm).toLowerCase();
            if (title.includes(lk) || origSrc.includes(lk) || thumbSrcItem.includes(lk)) {
              monumentBoost += 100;
              break;
            }
          }
        } catch (e) {
          // ignore
        }
        
        if (isGoodImage && item.original && item.original.source) {
          const cand = item.original.source;
          // Rapido rifiuto su pattern URL sospetti
          if (badUrlPattern.test(String(cand).toLowerCase())) continue;
          // Verifica che l'URL immagine selezionato ritorni un content-type immagine e non sia piccolo/svg
          try {
            const headResp = await fetch(cand, { method: 'HEAD' });
            const ct = String(headResp.headers.get('content-type') || '').toLowerCase();
            const cl = Number(headResp.headers.get('content-length') || '0');
            if (ct.startsWith('image/') && !ct.includes('svg') && (!cl || cl > 1500)) {
              chosenUrl = cand;
              break;
            }
          } catch (err) {
            // Se HEAD fallisce, salta questo candidato per evitare risorse errate
            continue;
          }
        }
      }
      
  // Secondo passaggio: se non è stata trovata una cityscape valida, prendi la prima immagine accettabile (salta URL segnalati)
      if (!chosenUrl) {
        for (const item of items) {
          if (!item || item.type !== 'image') continue;
          const title = String(item.title || '').toLowerCase();
          if (title.endsWith('.svg')) continue;
          if (badTitle.test(title)) continue;

          const origSrc = String(item.original?.source || '').toLowerCase();
          const thumbSrcItem = String(item.thumbnail?.source || '').toLowerCase();
          if (badUrlPattern.test(origSrc) || badUrlPattern.test(thumbSrcItem)) continue;

          // preferisci l'originale se presente
          if (item.original && item.original.source) {
            const cand = item.original.source;
            if (badUrlPattern.test(String(cand).toLowerCase())) continue;
            try {
              const headResp = await fetch(cand, { method: 'HEAD' });
              const ct = String(headResp.headers.get('content-type') || '').toLowerCase();
              const cl = Number(headResp.headers.get('content-length') || '0');
              if (ct.startsWith('image/') && !ct.includes('svg') && (!cl || cl > 1200)) {
                chosenUrl = cand;
                break;
              }
            } catch (err) {
              // fallthrough to next
            }
          }
          if (item.thumbnail && item.thumbnail.source) {
            const cand = item.thumbnail.source;
            if (badUrlPattern.test(String(cand).toLowerCase())) continue;
            try {
              const headResp = await fetch(cand, { method: 'HEAD' });
              const ct = String(headResp.headers.get('content-type') || '').toLowerCase();
              const cl = Number(headResp.headers.get('content-length') || '0');
              if (ct.startsWith('image/') && !ct.includes('svg') && (!cl || cl > 1200)) {
                chosenUrl = cand;
                break;
              }
            } catch (err) {
              // ignore
            }
          }
        }
      }

  if (chosenUrl) {
        const content = (longExtract || searchData.extract || '').toLowerCase();
        const activities = generateActivitiesFromText(content);
        console.debug('[city-images] returning wikipedia media-list image', { title: searchData.title, imageUrl: chosenUrl });
        if (isAlreadyUsed(chosenUrl)) {
          // if already used, pretend not found and allow fallbacks
        } else {
          markUsed(chosenUrl);
          return NextResponse.json({
            imageUrl: chosenUrl,
          title: searchData.title,
          description: chooseDescription(searchData.extract, cityName as string),
          longExtract,
          activities,
          source: 'wikipedia',
          lang: usedLang
          });
        }
      }
    }

    // Se non viene trovata alcuna immagine, restituisci le informazioni del sommario (se presenti) o fai fallback a null con attività generate
  const content = (longExtract || searchData?.extract || '')?.toLowerCase() || '';
  const activities = generateActivitiesFromText(content);

    

  // Prova Pexels (foto gratuite di alta qualità) come fallback se Wikipedia non ha fornito un'immagine utilizzabile
    const PEXELS_KEY = process.env.PEXELS_API_KEY;
    if (PEXELS_KEY) {
      try {
        const query = `${pageTitle || cityName} city skyline`;
        const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3`;
        const pResp = await fetch(pexelsUrl, { headers: { Authorization: PEXELS_KEY } });
        if (pResp.ok) {
          const pData = await pResp.json();
          const photo = pData?.photos?.[0];
          const cand = photo?.src?.large2x || photo?.src?.large || photo?.src?.original;
          if (cand) {
            try {
              const head = await fetch(cand, { method: 'HEAD' });
              const ct = String(head.headers.get('content-type') || '').toLowerCase();
              const cl = Number(head.headers.get('content-length') || '0');
                if (ct.startsWith('image/') && !ct.includes('svg') && (!cl || cl > 2000)) {
                // skip if already used
                if (isAlreadyUsed(cand)) {
                  // continue to final fallback
                } else {
                  markUsed(cand);
                  console.debug('[city-images] returning pexels image', { city: pageTitle || cityName, imageUrl: cand });
                  return NextResponse.json({
      imageUrl: cand,
      title: photo?.alt || searchData?.title || pageTitle || cityName,
  description: chooseDescription(searchData?.extract, cityName as string),
      longExtract,
      activities,
      source: 'pexels',
      lang: usedLang
    });
                }
              }
            } catch (err) {
              // se la richiesta HEAD fallisce, ignora e continua verso il fallback finale
            }
          }
        }
      } catch (err) {
        // ignora i fallimenti di Pexels e continua verso il fallback finale
      }
    }

    return NextResponse.json({
      imageUrl: null,
      title: searchData?.title || null,
      description: searchData?.extract || null,
      longExtract,
      activities,
      source: 'wikipedia'
    });

  } catch (error) {
  // Registra a livello debug e restituisci informazioni di fallback (evita stack trace rumorosi per 404 attesi)
    console.debug('[city-images] fallback for', cityName, String(error));
    return NextResponse.json({
      imageUrl: null,
      title: cityName,
      description: `Scopri la splendida città di ${cityName}`,
      source: 'fallback'
    });
  }
}

// --- Image deduplication helpers ---
function normalizeUrl(u: any) {
  if (!u) return '';
  try {
    const s = String(u).split('?')[0].replace(/\/+$/, '').toLowerCase();
    return s;
  } catch (e) {
    return String(u || '').toLowerCase();
  }
}

const usedImages = new Set<string>(
  // seed used images from the static destinations dataset to avoid reusing those URLs
  (Array.isArray(destinations) ? destinations.flatMap(d => [d.image, ...(d.images || [])]) : [])
    .filter(Boolean)
    .map(normalizeUrl)
    .filter(Boolean)
);

function isAlreadyUsed(url: string | null | undefined) {
  const n = normalizeUrl(url);
  return n ? usedImages.has(n) : false;
}

function markUsed(url: string | null | undefined) {
  const n = normalizeUrl(url);
  if (n) usedImages.add(n);
}

function generateActivitiesFromText(content: string) {
  const acts: any[] = [];
  const push = (id: string, name: string, desc: string, icon = '📍') => {
    acts.push({ id, name, description: desc, icon });
  };

  if (!content || content.length === 0) {
    // Generic suggestions in Italian
    push('g-1', 'Tour della città', 'Visita i monumenti principali e i punti di interesse', '🏛️');
    push('g-2', 'Esperienze gastronomiche', 'Assaggia i piatti tipici locali', '🍽️');
    push('g-3', 'Tour a piedi', 'Esplora i quartieri più caratteristici a piedi', '🚶');
    return acts;
  }

    if (content.includes('spiaggia') || content.includes('isola') || content.includes('mare')) {
    push('beach-1', 'Giornata in spiaggia', 'Rilassati in una delle migliori spiagge locali', '🏖️');
    push('beach-2', 'Sport acquatici', 'Snorkeling, diving o windsurf', '🤿');
  }
    if (content.includes('museo') || content.includes('musei') || content.includes('arte')) {
    push('museum-1', 'Visita ai musei', 'Scopri le collezioni e mostre locali', '🖼️');
  }
    if (content.includes('tempio') || content.includes('templ') || content.includes('shrine')) {
    push('temple-1', 'Visita ai templi', 'Esplora i luoghi spirituali e storici', '⛩️');
  }
    if (content.includes('trek') || content.includes('sentiero') || content.includes('montagna')) {
    push('trek-1', 'Trekking ed escursioni', 'Percorsi naturali e panoramici', '🥾');
  }
    if (content.includes('cibo') || content.includes('gastronom') || content.includes('mercato')) {
    push('food-1', 'Tour gastronomico', 'Assaggia le specialità locali e visita i mercati', '🍣');
  }

  // Add some generic suggestions if none matched
    if (acts.length === 0) {
    push('g-1', 'Tour della città', 'Visita i monumenti principali e i punti di interesse', '🏛️');
    push('g-2', 'Esperienze gastronomiche', 'Assaggia i piatti tipici locali', '🍽️');
  }

  return acts.slice(0, 6);
}

// Heuristics for description fallback
function isGenericDescription(text: string | null | undefined) {
  if (!text) return true;
  const s = String(text).trim().toLowerCase();
  if (!s) return true;
  // Patterns that indicate overly generic or unhelpful descriptions
  const genericPatterns = [/^view\b/, /^vista\b/, /^panorama\b/, /^picture of\b/, /^photo of\b/, /^image of\b/, /^veduta\b/];
  for (const p of genericPatterns) if (p.test(s)) return true;
  // too short or too few words
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 8) return true;
  return false;
}

function chooseDescription(maybe: string | null | undefined, cityName: string) {
  try {
    if (!maybe || isGenericDescription(maybe)) {
      return `Scopri ${cityName} con la sua cultura, attrazioni ed esperienze uniche.`;
    }
    return maybe;
  } catch (e) {
    return `Scopri ${cityName} con la sua cultura, attrazioni ed esperienze uniche.`;
  }
}

// stima dei prezzi rimossa - i prezzi non sono più forniti dall'API

  // Euristica: determina se il titolo di una pagina Wikipedia corrisponde a un luogo (città/paese/paesino)
  async function isWikipediaPagePlace(title: string, host: string) {
    try {
      const query = `https://${host}/w/api.php?action=query&format=json&prop=categories|pageprops&titles=${encodeURIComponent(title)}&cllimit=50&origin=*`;
      const resp = await fetch(query);
      if (!resp.ok) return false;
      const data = await resp.json();
      const pages = data?.query?.pages || {};
      const pageKey = Object.keys(pages)[0];
      const page = pages[pageKey] || {};

  // Controlla le categorie per parole chiave correlate a luoghi (Italiano/Inglese)
      const categories = (page.categories || []).map((c: any) => String(c.title || '').toLowerCase());
      const placeKeywords = ['città', 'comune', 'capoluogo', 'cittadini', 'popolazione', 'city', 'town', 'village', 'municipality', 'human settlement', 'populated'];
      for (const cat of categories) {
        for (const kw of placeKeywords) {
          if (cat.includes(kw)) return true;
        }
      }

  // Se pageprops contiene un wikibase_item, consulta Wikidata per ispezionare P31 (instance of)
      const wikibase = page.pageprops?.wikibase_item;
      if (wikibase) {
        try {
          const wdUrl = `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(wikibase)}.json`;
          const wdResp = await fetch(wdUrl);
          if (!wdResp.ok) return false;
          const wd = await wdResp.json();
          const entity = wd?.entities?.[wikibase];
          const claims = entity?.claims || {};
          const p31 = claims?.P31 || [];
          const ids = p31.map((c: any) => c?.mainsnak?.datavalue?.value?.id).filter(Boolean);
          if (ids.length === 0) return false;

          // Recupera le etichette per gli ID P31 per rilevare 'city'/'town'/'village' nelle etichette
          const idsChunk = ids.join('|');
          const labelsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(idsChunk)}&props=labels&languages=en|it&format=json&origin=*`;
          const labelsResp = await fetch(labelsUrl);
          if (!labelsResp.ok) return false;
          const labelsData = await labelsResp.json();
          const entities = labelsData?.entities || {};
          for (const id of Object.keys(entities)) {
            const ent = entities[id];
            const labs = [];
            if (ent?.labels?.en?.value) labs.push(String(ent.labels.en.value).toLowerCase());
            if (ent?.labels?.it?.value) labs.push(String(ent.labels.it.value).toLowerCase());
            for (const l of labs) {
              for (const kw of placeKeywords) {
                if (l.includes(kw)) return true;
              }
            }
          }
        } catch (e) {
          // ignora gli errori di Wikidata e fai fallback al controllo delle categorie
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  }