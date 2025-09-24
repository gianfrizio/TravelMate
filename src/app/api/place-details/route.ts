import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const q = searchParams.get('q');

  const GEO_KEY = process.env.GEOAPIFY_API_KEY;
  if (!GEO_KEY) {
    return NextResponse.json({ error: 'GEOAPIFY_API_KEY mancante' }, { status: 500 });
  }

  try {
    let url = '';
    if (lat && lon) {
      // Usa reverse geocoding per ottenere informazioni sul luogo dalle coordinate
      url = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(
        lon
      )}&format=json&apiKey=${encodeURIComponent(GEO_KEY)}`;
    } else if (q) {
      // Usa il forward geocoding cercando per testo
      url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&limit=1&apiKey=${encodeURIComponent(
        GEO_KEY
      )}`;
    } else {
      return NextResponse.json({ error: 'Provide lat/lon or q parameter' }, { status: 400 });
    }

    const resp = await fetch(url);
    const raw = await resp.text();
    if (!resp.ok) {
      console.error('[place-details] Geoapify error', { status: resp.status, body: raw });
      return NextResponse.json({ error: 'Geoapify error', status: resp.status, body: raw }, { status: 502 });
    }

    let data = JSON.parse(raw);
    // Se è presente il flag debug, restituisci le features raw per ispezione
    const debug = request.nextUrl.searchParams.get('debug');
    if (debug === '1') {
      return NextResponse.json({ features: data.features || [] });
    }
    // Seleziona la feature migliore usando un'euristica che preferisce feature amministrative o di tipo luogo
    let feature = null;
    const features = (data.features && Array.isArray(data.features) ? data.features : []);
    if (features.length === 1) {
      feature = features[0];
    } else if (features.length > 1) {
      // scoring: punteggio più alto per feature di tipo città/luogo/amministrativo
      const scoreFeature = (f: any) => {
        const p = f.properties || {};
        let score = 0;
        // preferisci tipi espliciti di luogo
        const placeTypes = ['city', 'town', 'village', 'hamlet', 'municipality'];
        if (p.type && placeTypes.includes(String(p.type).toLowerCase())) score += 50;
        // la proprietà class può indicare 'place' o 'boundary'
        if (p.class === 'place') score += 30;
        if (p.class === 'boundary' || p.class === 'administrative') score += 25;
        // la presenza di campi amministrativi è un segnale forte
        if (p.city || p.town || p.village) score += 40;
        if (p.state || p.county || p.region) score += 20;
        // preferisci feature con indirizzo formattato
        if (p.formatted) score += 5;
        // de-prioritizza i POI (point of interest)
        if (p.class === 'poi' || /poi|atm|shop|amenity/i.test(String(p.type || ''))) score -= 20;
        // piccolo incremento per rank più alto quando disponibile
        if (typeof p.rank === 'number') score += Math.max(0, 10 - p.rank);
        return score;
      };

      let best = features[0];
      let bestScore = scoreFeature(best);
      for (let i = 1; i < features.length; i++) {
        const s = scoreFeature(features[i]);
        if (s > bestScore) {
          best = features[i];
          bestScore = s;
        }
      }
      feature = best;
    }

  // Se il reverse geocoding non ha restituito feature, prova un fallback con forward search usando le coordinate come testo
    if (!feature && lat && lon) {
      try {
        const searchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(lat + "," + lon)}&limit=1&apiKey=${encodeURIComponent(
          GEO_KEY
        )}`;
        const sresp = await fetch(searchUrl);
        const sraw = await sresp.text();
        if (sresp.ok) {
          const sdata = JSON.parse(sraw);
          feature = (sdata.features && sdata.features[0]) || null;
        } else {
          console.warn('[place-details] fallback search failed', { status: sresp.status, body: sraw });
        }
      } catch (err) {
        console.warn('[place-details] fallback search error', err);
      }
    }

  // Se la feature selezionata sembra un POI, prova una ricerca forward per trovare la città/luogo amministrativo
    if (feature) {
      const p = feature.properties || {};
      const poiLike = p.class === 'poi' || /poi|amenity|tourism|historic|shop|atm/i.test(String(p.type || ''));
      const hasAdminType = (p.type && /city|town|village|state|county|region|administrative/i.test(String(p.type))) || p.class === 'place' || p.class === 'boundary';

      if (poiLike && !hasAdminType) {
        // try to find city using known fields (city + country) or fallback to q param
        const cityName = p.city || p.town || p.village || request.nextUrl.searchParams.get('q') || null;
        const countryName = p.country || null;
        if (cityName) {
          try {
            const txt = countryName ? `${cityName}, ${countryName}` : cityName;
            const searchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(txt)}&limit=1&apiKey=${encodeURIComponent(
              GEO_KEY
            )}`;
            const sresp = await fetch(searchUrl);
            const sraw = await sresp.text();
            if (sresp.ok) {
              const sdata = JSON.parse(sraw);
              const candidate = (sdata.features && sdata.features[0]) || null;
              if (candidate) {
                const cp = candidate.properties || {};
                const candidateIsAdmin = (cp.type && /city|town|village|state|county|region|administrative/i.test(String(cp.type))) || cp.class === 'place' || cp.class === 'boundary';
                if (candidateIsAdmin) {
                  feature = candidate;
                }
              }
            }
          } catch (err) {
            // ignore and proceed with original feature
          }
          // If that didn't yield an administrative candidate, try a forward search using the coordinates
          if (!feature && lat && lon) {
            try {
              const coordSearch = `${lat},${lon}`;
              const searchUrl2 = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(coordSearch)}&limit=5&apiKey=${encodeURIComponent(
                GEO_KEY
              )}`;
              const sresp2 = await fetch(searchUrl2);
              const sraw2 = await sresp2.text();
              if (sresp2.ok) {
                const sdata2 = JSON.parse(sraw2);
                const candidates = (sdata2.features && sdata2.features) || [];
                for (const c of candidates) {
                  const cp = c.properties || {};
                  const candidateIsAdmin = (cp.type && /city|town|village|state|county|region|administrative/i.test(String(cp.type))) || cp.class === 'place' || cp.class === 'boundary';
                  if (candidateIsAdmin) {
                    feature = c;
                    break;
                  }
                }
              }
            } catch (err) {
              // ignore
            }
          }
        }
      }
    }

    const result = feature
      ? {
          formatted: feature.properties.formatted,
          name: feature.properties.name || feature.properties.formatted,
          country: feature.properties.country,
          city: feature.properties.city || feature.properties.town || feature.properties.village,
          state: feature.properties.state,
          postcode: feature.properties.postcode,
          lat: feature.properties.lat || (feature.geometry && feature.geometry.coordinates[1]),
          lon: feature.properties.lon || (feature.geometry && feature.geometry.coordinates[0]),
          datasource: feature.properties.datasource
        }
      : null;

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[place-details] error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
