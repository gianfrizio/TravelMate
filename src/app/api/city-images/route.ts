import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cityName = request.nextUrl.searchParams.get('city');
  
  if (!cityName) {
    return NextResponse.json({ error: 'City name required' }, { status: 400 });
  }

  try {
    // Read optional coordinates and prepare query title
    let lat = request.nextUrl.searchParams.get('lat');
    let lon = request.nextUrl.searchParams.get('lon');
    let queryTitle = cityName;
    const GEO_KEY = process.env.GEOAPIFY_API_KEY;

    // If no coords provided but we have a Geoapify key, try forward geocoding to disambiguate the city name
    if ((!lat || !lon) && GEO_KEY) {
      try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&limit=6&format=json&apiKey=${encodeURIComponent(GEO_KEY)}`;
        const geoResp = await fetch(geoUrl);
        if (geoResp.ok) {
          const geo = await geoResp.json();
          const feats = geo?.features || [];
          // Prefer features that look like populated places (city, town, village, municipality)
          const placeFeature = feats.find((f: any) => {
            const p = f?.properties || {};
            const join = JSON.stringify(p).toLowerCase();
            return /city|town|village|municipality|locality|comune|capoluogo/.test(join);
          }) || feats[0];

          if (placeFeature) {
            const candidate = placeFeature?.properties?.name || placeFeature?.properties?.formatted;
            if (candidate) queryTitle = candidate;
            // if the feature has geometry, use its coordinates as a hint for later image selection
            const coords = placeFeature?.geometry?.coordinates;
            if (coords && coords.length >= 2) {
              lon = String(coords[0]);
              lat = String(coords[1]);
            }
          }
        }
      } catch (err) {
        // ignore forward geocoding failures and continue
      }
    }

    // If lat/lon were provided explicitly, try to disambiguate using Geoapify reverse geocoding (if API key available)
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
        // ignore and fallback to cityName
      }
    }

    // Step 1: Try the Italian Wikipedia summary endpoint for an exact page using the disambiguated title, fallback to English
    const summaryUrlIt = `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryTitle)}`;
    const summaryUrlEn = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryTitle)}`;
    let usedLang: 'it' | 'en' = 'it';
    let searchResponse = await fetch(summaryUrlIt);
    if (!searchResponse.ok) {
      // try English as fallback
      searchResponse = await fetch(summaryUrlEn);
      usedLang = 'en';
    }
    let searchData: any = null;

    // If summary endpoint returns 404, try the search endpoint to find a matching title
    if (searchResponse.status === 404) {
      // Prefer searching in the used language, fallback to English search if needed
      const searchHost = usedLang === 'it' ? 'it.wikipedia.org' : 'en.wikipedia.org';
      const searchApi = `https://${searchHost}/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(cityName)}&origin=*`;
      const searchApiResp = await fetch(searchApi);
      if (searchApiResp.ok) {
        const searchApiData = await searchApiResp.json();
        const allResults = searchApiData?.query?.search || [];

        // Prefer results whose snippet indicates a place/city page
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

        // Fallback to the first result if none clearly match a place page
        const first = allResults[0];
        if (!chosenTitle && first && first.title) chosenTitle = first.title;

        if (chosenTitle) {
          const title = chosenTitle;
          // fetch the summary in the same language as the search
          searchResponse = await fetch(`https://${searchHost}/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
          usedLang = searchHost.startsWith('it.') ? 'it' : 'en';
        }
      }
    }

    if (searchResponse.ok) {
      searchData = await searchResponse.json();
    }
    
    // Check if we have a thumbnail image
    // Try to fetch a longer extract (more content) from the Wikipedia API
    let longExtract: string | null = null;
    try {
      // Try extracting a longer text from Italian Wikipedia first, otherwise fallback to English
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
      // ignore extract failures
    }

    // Prepare landmark map (hoisted so media-list fallback can also benefit)
  // Normalize pageTitle: strip parenthetical disambiguation like 'Rome (disambiguation)'
  let pageTitleRaw = searchData?.title || cityName;
  const pageTitle = String(pageTitleRaw).replace(/\s*\([^)]*\)\s*/g, '').trim();
    const LANDMARKS: Record<string, string[]> = {
      roma: ['Colosseo', 'Colosseum', 'Pantheon', 'Foro Romano', 'Basilica di San Pietro', 'Piazza Navona'],
      rome: ['Colosseum', 'Pantheon', 'Roman Forum', 'St Peter', "St Peter's Basilica", 'Piazza Navona'],
      parigi: ['Torre Eiffel', 'Tour Eiffel', 'Louvre', 'Notre-Dame', 'Montmartre'],
      paris: ['Eiffel Tower', 'Louvre', 'Notre-Dame', 'Montmartre'],
      londra: ['Big Ben', 'Tower Bridge', 'London Eye', 'Buckingham Palace'],
      london: ['Big Ben', 'Tower Bridge', 'London Eye', 'Buckingham Palace'],
      firenze: ['Duomo', 'Cathedral of Santa Maria del Fiore', 'Ponte Vecchio', 'Piazza della Signoria'],
      florence: ['Duomo', 'Ponte Vecchio', 'Uffizi', 'Piazza della Signoria'],
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
    };

    const normalize = (s = '') => String(s).toLowerCase();
    const keyGuess = Object.keys(LANDMARKS).find(k => normalize(pageTitle).includes(k) || normalize(cityName).includes(k));
    const landmarks = keyGuess ? LANDMARKS[keyGuess] : [];

    // Ensure the Wikipedia page we found is actually a place (city/town). If not, drop wiki description to avoid mixing unrelated content.
    try {
      const wikiHost = usedLang === 'it' ? 'it.wikipedia.org' : 'en.wikipedia.org';
      // isWikipediaPagePlace is defined later in this file
      // If the page is not a place, clear searchData/longExtract so we don't use unrelated descriptions
      // Note: we intentionally swallow errors here and continue with fallback image selection
      // which will then rely more on cityName and extracted landmarks.
      // eslint-disable-next-line no-await-in-loop
      const pageIsPlace = await isWikipediaPagePlace(pageTitle, wikiHost);
      if (!pageIsPlace) {
        console.debug('[city-images] wikipedia page is not a place, ignoring wiki extract for', pageTitle);
        searchData = null;
        longExtract = null;
      }
    } catch (e) {
      // ignore and continue
    }

    // Helper: extract candidate landmark phrases from a Wikipedia extract.
    // Simple heuristic: capture multi-word capitalized sequences and filter by length/frequency.
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
        // ignore obvious sentences starts that are not landmarks
        if (/^(The|A|An|Il|La|Le|Lo|I|Gli|Una|Un)\b/.test(s)) continue;
        freq[s] = (freq[s] || 0) + 1;
      }
      // sort by frequency and length
      const candidates = Object.keys(freq).sort((a, b) => (freq[b] - freq[a]) || (b.length - a.length));
      return candidates.slice(0, 6);
    }

    // Prefer Unsplash for city photos when an access key is configured.
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (UNSPLASH_KEY) {
      try {
        // (landmarks is hoisted above)

        // Build prioritized queries: try landmark-focused queries first
        const queries: string[] = [];
        if (landmarks.length) {
          // Monument-first: try pure landmark names alone, then combined with city
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
        // If we don't have static landmarks, try extracting landmark-like phrases from longExtract (Wikipedia)
        if (!landmarks.length && longExtract) {
          try {
            const auto = extractLandmarksFromText(longExtract);
            if (auto && auto.length) {
              // use capitalized phrases as pseudo-landmarks
              for (const a of auto) {
                queries.push(a);
                queries.push(`${pageTitle} ${a}`);
              }
            }
          } catch (e) {
            // ignore
          }
        }

        // Try queries in order; stop on first query that returns candidates
        for (const q of queries) {
          const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=8&orientation=landscape`;
          const uResp = await fetch(unsplashUrl, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } });
          if (!uResp.ok) continue;
          const uData = await uResp.json();
          results = Array.isArray(uData?.results) ? uData.results : [];
          if (results.length) break;
        }

        // Score candidates: prefer those mentioning the city or the landmark keywords in location/title/alt_description or having city-related tags
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

          // Server-side blacklist: filter out obvious irrelevant subjects (birds, animals, closeups)
          const blacklisted = ['gull', 'seagull', 'bird', 'dog', 'cat', 'puppy', 'portrait', 'face', 'selfie', 'person', 'people', 'gabbiano', 'gabbiani', 'uccello', 'uccelli', 'persona', 'persone'];
          let isBlacklisted = false;
          try {
            for (const b of blacklisted) {
              if (alt.includes(b) || desc.includes(b) || loc.includes(b) || tags.some((t: string) => t.includes(b))) {
                isBlacklisted = true;
                break;
              }
            }
          } catch (e) {
            // ignore
          }
          if (isBlacklisted) {
            // skip obviously irrelevant photos early
            continue;
          }

          // City/landmark matches
          if (alt.includes(cityLower) || desc.includes(cityLower)) score += 30;
          if (loc && loc.includes(cityLower)) score += 40;
          for (const t of tags) {
            if (t.includes(cityLower)) score += 25;
            for (const ct of cityTags) if (t.includes(ct)) score += 6;
          }
          for (const ct of cityTags) {
            if (alt.includes(ct) || desc.includes(ct)) score += 5;
          }

          // Strong boost when landmark keywords appear in alt/desc/loc/tags
          for (const lk of landmarkKeywords) {
            if (!lk) continue;
            if (alt.includes(lk) || desc.includes(lk)) score += 80;
            if (loc.includes(lk)) score += 100;
            if (tags.some((t: string) => t.includes(lk))) score += 60;
          }

          // small boost for higher likes/popularity
          score += (photo?.likes || 0) * 0.01;

          const cand = photo?.urls?.regular || photo?.urls?.full || photo?.urls?.raw;
          if (!cand) continue;

          // Penalize obvious placeholders by file extension or known path patterns
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
          return NextResponse.json({
            imageUrl: best.cand,
            // prefer photo alt description but fall back to the localized wiki title
            title: best.photo?.alt_description || (usedLang === 'it' ? searchData?.title : searchData?.title) || pageTitle,
            description: searchData?.extract || null,
            longExtract,
            activities,
            source: 'unsplash',
            lang: usedLang
          });
        }
      } catch (err) {
        // ignore Unsplash errors and continue with Wikipedia
      }
    }

    if (searchData && searchData.thumbnail && searchData.thumbnail.source) {
      // More aggressive filtering to avoid flags, logos, coats of arms, or administrative symbols
      const thumbSrc = String(searchData.thumbnail.source || '').toLowerCase();
      const thumbTitle = String(searchData.title || '').toLowerCase();
      
      // Enhanced patterns to catch more flag/logo variations
      const badImagePattern = /flag|bandiera|bandera|flagge|drapeau|coat_of_arms|coat-of-arms|logo|seal|emblem|stemma|crest|arms|heraldic|municipal|city_flag|locator|map|symbol|badge|insignia/;
      const badTitlePattern = /flag|bandiera|bandera|flagge|drapeau|coat|arms|emblem|stemma|seal|logo|crest|heraldic|municipal|symbol|badge|insignia/;
      
      let acceptThumb = true;
      try {
        if (badImagePattern.test(thumbSrc) || badTitlePattern.test(thumbTitle)) {
          acceptThumb = false;
        }
      } catch (e) {
        // ignore and allow thumbnail
      }

      if (acceptThumb) {
        // Get high resolution version by modifying the URL
        const imageUrl = searchData.thumbnail.source.replace(/\/\d+px-/, '/800px-');

        // Quick HEAD validation: ensure it's an image, not SVG, and not tiny (avoid icons/flags)
        try {
          const headResp = await fetch(imageUrl, { method: 'HEAD' });
          const ct = String(headResp.headers.get('content-type') || '').toLowerCase();
          const cl = Number(headResp.headers.get('content-length') || '0');
          const badUrlPatternLocal = /\/flag[_-]|flag_of_|coat_of_arms|coat-of-arms|logo|seal|symbol|insignia|badge|chart|graph|diagram|screenshot/i;
          if (ct.startsWith('image/') && !ct.includes('svg') && cl > 10000 && !badUrlPatternLocal.test(String(imageUrl).toLowerCase())) {
            // Build activities and price heuristics based on the Italian longExtract if available
            const content = (longExtract || searchData.extract || '').toLowerCase();
            const activities = generateActivitiesFromText(content);

            console.debug('[city-images] returning wikipedia thumbnail', { title: searchData.title, imageUrl });
            return NextResponse.json({
              imageUrl,
              title: searchData.title,
              description: searchData.extract,
              longExtract,
              activities,
              source: 'wikipedia',
              lang: usedLang
            });
          }
        } catch (err) {
          // if HEAD fails, don't accept the thumbnail (fallthrough to media-list)
        }
      }
      // otherwise fall-through to media-list lookup
    }

    // Fallback: Try to get images from the page
    // Use the same language host we used for the summary to fetch the media list (prefer Italian when available)
    const wikiHost = usedLang === 'it' ? 'it.wikipedia.org' : 'en.wikipedia.org';
    const imagesUrl = `https://${wikiHost}/api/rest_v1/page/media-list/${encodeURIComponent(pageTitle)}`;
    const imagesResponse = await fetch(imagesUrl);
    
      if (imagesResponse.ok) {
      const imagesData = await imagesResponse.json();
      
      // Enhanced filtering for media items - avoid flags, logos, maps, administrative symbols
      const items = imagesData.items || [];
  // Titles/URLs that strongly indicate the media item is not a photographic city image
  const badTitle = /flag|bandiera|bandera|flagge|drapeau|coat_of_arms|coat-of-arms|coat|arms|logo|seal|emblem|stemma|crest|heraldic|municipal|city_flag|locator|map|symbol|badge|insignia|administrative|official|chart|graph|diagram|population|statistics|statistic|table|screenshot|infographic|poster|diagramma|grafico|grafici/i;
  const badUrlPattern = /\/flag[_-]|flag_of_|\/thumb\/.*Flag|coat_of_arms|coat-of-arms|logo|seal|symbol|insignia|badge|chart|graph|diagram|population|stats|statistic|histogram|bar_chart|diagramma|grafico|screenshot|poster/i;
      let chosenUrl: string | null = null;
      
      // First pass: look for high-quality landscape/cityscape images
      for (const item of items) {
        if (!item || item.type !== 'image') continue;
        const title = String(item.title || '').toLowerCase();
        if (title.endsWith('.svg')) continue;
        if (badTitle.test(title)) continue;

        const origSrc = String(item.original?.source || '').toLowerCase();
        const thumbSrcItem = String(item.thumbnail?.source || '').toLowerCase();
        if (badUrlPattern.test(origSrc) || badUrlPattern.test(thumbSrcItem)) continue;

        // Prefer images that sound like cityscapes, landscapes, or general views
        const goodImagePattern = /skyline|panorama|view|landscape|cityscape|street|piazza|downtown|centro|vista|veduta|harbor|port|river|riverside|mountain|montagna/i;
        const isGoodImage = goodImagePattern.test(title) || goodImagePattern.test(origSrc) || goodImagePattern.test(thumbSrcItem);

        // Monument boost: if the item title or source mentions one of the known landmarks, prefer it strongly
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
          // Quick rejection on suspicious URL patterns
          if (badUrlPattern.test(String(cand).toLowerCase())) continue;
          // Validate the chosen image URL returns an image content-type and is not tiny/svg
          try {
            const headResp = await fetch(cand, { method: 'HEAD' });
            const ct = String(headResp.headers.get('content-type') || '').toLowerCase();
            const cl = Number(headResp.headers.get('content-length') || '0');
            if (ct.startsWith('image/') && !ct.includes('svg') && (!cl || cl > 1500)) {
              chosenUrl = cand;
              break;
            }
          } catch (err) {
            // If HEAD fails, prefer skipping this candidate to avoid wrong resources
            continue;
          }
        }
      }
      
      // Second pass: if no good cityscape found, take any acceptable image (skip flagged URLs)
      if (!chosenUrl) {
        for (const item of items) {
          if (!item || item.type !== 'image') continue;
          const title = String(item.title || '').toLowerCase();
          if (title.endsWith('.svg')) continue;
          if (badTitle.test(title)) continue;

          const origSrc = String(item.original?.source || '').toLowerCase();
          const thumbSrcItem = String(item.thumbnail?.source || '').toLowerCase();
          if (badUrlPattern.test(origSrc) || badUrlPattern.test(thumbSrcItem)) continue;

          // prefer original if present
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
        return NextResponse.json({
          imageUrl: chosenUrl,
          title: searchData.title,
          description: searchData.extract,
          longExtract,
          activities,
          source: 'wikipedia',
          lang: usedLang
        });
      }
    }

    // If no image found, return the summary info (if any) or fallback to null with generated activities/price
  const content = (longExtract || searchData?.extract || '')?.toLowerCase() || '';
  const activities = generateActivitiesFromText(content);

    

    // Try Pexels (high-quality free photos) as a fallback when Wikipedia didn't provide a usable image
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
                console.debug('[city-images] returning pexels image', { city: pageTitle || cityName, imageUrl: cand });
                return NextResponse.json({
      imageUrl: cand,
      title: photo?.alt || searchData?.title || pageTitle || cityName,
      description: searchData?.extract || null,
      longExtract,
      activities,
      source: 'pexels',
      lang: usedLang
    });
              }
            } catch (err) {
              // if HEAD fails, ignore and continue to final fallback
            }
          }
        }
      } catch (err) {
        // ignore Pexels failures and continue to final fallback
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
    // Log at debug level and return fallback info (avoid noisy stack traces for expected 404s)
    console.debug('[city-images] fallback for', cityName, String(error));
    return NextResponse.json({
      imageUrl: null,
      title: cityName,
      description: `Scopri la splendida città di ${cityName}`,
      source: 'fallback'
    });
  }
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

// price estimation removed - pricing is no longer provided by the API

  // Heuristic: determine whether a Wikipedia page title corresponds to a place (city/town/village)
  async function isWikipediaPagePlace(title: string, host: string) {
    try {
      const query = `https://${host}/w/api.php?action=query&format=json&prop=categories|pageprops&titles=${encodeURIComponent(title)}&cllimit=50&origin=*`;
      const resp = await fetch(query);
      if (!resp.ok) return false;
      const data = await resp.json();
      const pages = data?.query?.pages || {};
      const pageKey = Object.keys(pages)[0];
      const page = pages[pageKey] || {};

      // Check categories for place-related keywords (Italian/English)
      const categories = (page.categories || []).map((c: any) => String(c.title || '').toLowerCase());
      const placeKeywords = ['città', 'comune', 'capoluogo', 'cittadini', 'popolazione', 'city', 'town', 'village', 'municipality', 'human settlement', 'populated'];
      for (const cat of categories) {
        for (const kw of placeKeywords) {
          if (cat.includes(kw)) return true;
        }
      }

      // If pageprops contains a wikibase_item, consult Wikidata to inspect P31 (instance of)
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

          // Fetch labels for the P31 ids to detect 'city'/'town'/'village' in label
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
          // ignore wikidata errors and fall back to categories check
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  }