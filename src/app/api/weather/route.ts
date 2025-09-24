import { NextRequest, NextResponse } from 'next/server';
import { WeatherData } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const location = searchParams.get('location');

  // Se viene fornita una location, risolvila tramite Geoapify Places/Geocoding per ottenere lat/lng
  let resolvedLat = lat;
  let resolvedLng = lng;

  if ((!lat || !lng) && location) {
    const GEO_KEY = process.env.GEOAPIFY_API_KEY;
    if (!GEO_KEY) {
      return NextResponse.json({ error: 'Geocoding key mancante (GEOAPIFY_API_KEY)' }, { status: 400 });
    }

    const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&limit=1&apiKey=${encodeURIComponent(GEO_KEY)}`;
    console.log('[weather] Resolving location via Geoapify:', geoUrl.replace(/apiKey=[^&]+/, 'apiKey=REDACTED'));
    try {
      const geoResp = await fetch(geoUrl);
      const geoRaw = await geoResp.text();
      if (!geoResp.ok) {
        console.error('[weather] Geoapify non OK', { status: geoResp.status, body: geoRaw });
        return NextResponse.json({ error: 'Errore geocoding', status: geoResp.status, body: geoRaw }, { status: 502 });
      }
      const geoData = JSON.parse(geoRaw);
      if (geoData.features && geoData.features.length > 0) {
        resolvedLat = String(geoData.features[0].properties.lat || geoData.features[0].geometry.coordinates[1]);
        resolvedLng = String(geoData.features[0].properties.lon || geoData.features[0].geometry.coordinates[0]);
      } else {
        return NextResponse.json({ error: 'Location non trovata' }, { status: 404 });
      }
    } catch (err) {
      console.error('[weather] Errore Geoapify:', err);
      return NextResponse.json({ error: 'Errore durante geocoding' }, { status: 500 });
    }
  }

  if (!resolvedLat || !resolvedLng) {
    return NextResponse.json({ error: 'Coordinate mancanti' }, { status: 400 });
  }

  const API_KEY = process.env.OPENWEATHER_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key mancante' }, { status: 500 });
  }

  // Usa l'endpoint Current Weather v2.5 supportato dalle API key standard
  const targetUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
    resolvedLat
  )}&lon=${encodeURIComponent(resolvedLng)}&appid=${encodeURIComponent(API_KEY)}&units=metric&lang=it`;

  console.log('[weather] Fetching OpenWeather v2.5 URL:', targetUrl.replace(/appid=[^&]+/, 'appid=REDACTED'));

  try {
    const response = await fetch(targetUrl);
    const raw = await response.text();

    if (!response.ok) {
      console.error('[weather] OpenWeather non OK', { status: response.status, body: raw });
      const fallback: WeatherData = {
        temperature: 20,
        condition: response.status === 401 ? 'Invalid API key' : 'Informazioni meteo non disponibili',
        humidity: 60,
        windSpeed: 10,
        icon: '🌤️',
      };
      return NextResponse.json({ fallback, usingFallback: true, status: response.status, body: raw }, { status: 200 });
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error('[weather] Errore parsing JSON OpenWeather', raw);
      const fallback: WeatherData = {
        temperature: 20,
        condition: 'Risposta API non JSON',
        humidity: 60,
        windSpeed: 10,
        icon: '🌤️',
      };
      return NextResponse.json({ fallback, usingFallback: true, body: raw }, { status: 200 });
    }

    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      condition: data.weather?.[0]?.description || 'N/D',
      humidity: data.main.humidity,
      windSpeed: Math.round((data.wind?.speed || 0) * 3.6),
      icon: getWeatherIcon(data.weather?.[0]?.icon || '')
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Errore API meteo:', error);
    const fallback: WeatherData = {
      temperature: 20,
      condition: 'Informazioni meteo non disponibili',
      humidity: 60,
      windSpeed: 10,
      icon: '🌤️',
    };
    return NextResponse.json({ error: 'fallback', message: String(error), fallback }, { status: 200 });
  }
}

function getWeatherIcon(iconCode: string): string {
  const iconMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '⛅',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌦️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return iconMap[iconCode] || '🌤️';
}