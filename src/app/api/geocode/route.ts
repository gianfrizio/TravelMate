import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  const limit = request.nextUrl.searchParams.get('limit') || '5';
  // lingua predefinita per i risultati di geocoding (preferisci l'italiano)
  const lang = request.nextUrl.searchParams.get('lang') || 'it';

  const GEO_KEY = process.env.GEOAPIFY_API_KEY;
  if (!GEO_KEY) {
    return NextResponse.json({ error: 'GEOAPIFY_API_KEY mancante' }, { status: 500 });
  }

  // Richiedi risultati localizzati nella lingua preferita
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&limit=${encodeURIComponent(
    limit
  )}&lang=${encodeURIComponent(lang)}&apiKey=${encodeURIComponent(GEO_KEY)}`;

  try {
    const resp = await fetch(url);
    const raw = await resp.text();
    if (!resp.ok) {
      console.error('[geocode] Geoapify error', { status: resp.status, body: raw });
      return NextResponse.json({ error: 'Errore Geoapify', status: resp.status, body: raw }, { status: 502 });
    }
    const data = JSON.parse(raw);
    const suggestions = (data.features || []).map((f: any) => ({
      id: f.properties.place_id || f.properties.osm_id || `${f.properties.lat},${f.properties.lon}`,
  // formatted contiene il nome localizzato (es. "Roma, Italia" quando lang=it)
      name: f.properties.formatted || f.properties.name || f.properties.city || f.properties.country,
  // fornisce un campo country separato quando disponibile (localizzato)
      country: f.properties.country || f.properties.country_name || null,
      // country_code ISO (es. 'it', 'us') se disponibile
      country_code: f.properties.country_code || null,
      lat: f.properties.lat || (f.geometry && f.geometry.coordinates[1]),
      lon: f.properties.lon || (f.geometry && f.geometry.coordinates[0])
    }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('[geocode] error', err);
    return NextResponse.json({ error: 'Errore interno geocoding' }, { status: 500 });
  }
}
