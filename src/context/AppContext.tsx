"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Destination, User, ItineraryItem } from '@/types';
import { destinations } from '@/data/destinations';

interface AppState {
  user: User | null;
  favorites: string[];
  itinerary: ItineraryItem[];
  isLoading: boolean;
  lastSearchState: {
    query: string;
    continent: string;
    timestamp: number;
  } | null;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'ADD_TO_FAVORITES'; payload: string }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
  | { type: 'ADD_TO_ITINERARY'; payload: ItineraryItem }
  | { type: 'REMOVE_FROM_ITINERARY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<AppState> }
  | { type: 'SET_LAST_SEARCH'; payload: { query: string; continent: string } };
    
const initialState: AppState = {
  user: null,
  favorites: [],
  itinerary: [],
  isLoading: false,
  lastSearchState: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'ADD_TO_FAVORITES':
      if (state.favorites.includes(action.payload)) return state;
      return { ...state, favorites: [...state.favorites, action.payload] };
    
    case 'REMOVE_FROM_FAVORITES':
      return { 
        ...state, 
        favorites: state.favorites.filter(id => id !== action.payload) 
      };
    
    case 'ADD_TO_ITINERARY':
      return { ...state, itinerary: [...state.itinerary, action.payload] };
    
    case 'REMOVE_FROM_ITINERARY':
      return { 
        ...state, 
        itinerary: state.itinerary.filter(item => item.id !== action.payload) 
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOAD_FROM_STORAGE':
      return { ...state, ...action.payload };
    
    case 'SET_LAST_SEARCH':
      return { 
        ...state, 
        lastSearchState: {
          ...action.payload,
          timestamp: Date.now()
        }
      };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addToFavorites: (destinationId: string) => void;
  removeFromFavorites: (destinationId: string) => void;
  addToItinerary: (item: Omit<ItineraryItem, 'id' | 'addedAt'>) => void;
  removeFromItinerary: (itemId: string) => void;
  isFavorite: (destinationId: string) => boolean;
  setLastSearch: (query: string, continent: string) => void;
  getLastSearch: () => { query: string; continent: string } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carica da localStorage al montaggio
  useEffect(() => {
  // Legge i valori salvati grezzi
    const rawFavorites: unknown = JSON.parse(localStorage.getItem('travelmate-favorites') || '[]');
    const rawItinerary: unknown = JSON.parse(localStorage.getItem('travelmate-itinerary') || '[]');

  // Helper per risolvere identificatori (id o nome) all'id canonico del dataset
    const normalizeKey = (raw: unknown) => {
      if (raw == null) return '';
      let s = String(raw).trim();
  // Se la stringa contiene una virgola come 'Rome, Italy', prendi la prima parte
      if (s.includes(',')) s = s.split(',')[0].trim();
      return s.toLowerCase();
    };

    const resolveId = (ident: unknown): string | null => {
      if (!ident) return null;
  // Se è un oggetto con id o name, preferiscili
      if (typeof ident === 'object' && ident !== null) {
  // @ts-ignore - struttura dinamica proveniente da localStorage
        if ('id' in ident && (ident as any).id) return String((ident as any).id);
  // @ts-ignore
        if ('name' in ident && (ident as any).name) return String((ident as any).name);
      }

      const s = String(ident).trim();

  // Prova prima a cercare per id (esatto)
      const byId = destinations.find(d => d.id === s);
      if (byId) return byId.id;

  // Normalizza e prova a confrontare per nome in modo più flessibile
      const sNorm = normalizeKey(s);
      const byExactName = destinations.find(d => d.name.toLowerCase() === sNorm);
      if (byExactName) return byExactName.id;

  // Prova confronti per sottostringa (es. 'Rome' vs 'Rome, Italy' o 'New York City')
      const byIncludes = destinations.find(d => d.name.toLowerCase().includes(sNorm) || sNorm.includes(d.name.toLowerCase()));
      if (byIncludes) return byIncludes.id;

      return null;
    };

  // Normalizza i preferiti: prova a risolvere i valori salvati in id canonici quando possibile.
  // Mantieni le stringhe grezze non risolte così rimangono visibili nell'UI (non vogliamo eliminare silenziosamente i valori salvati dall'utente).
    let favorites: string[] = [];
    if (Array.isArray(rawFavorites)) {
      const resolvedList = rawFavorites.map((item: any) => {
        const resolved = resolveId(item);
  // Se risolto, usa l'id canonico; altrimenti mantieni il valore grezzo originale (stringificato)
        return resolved || (item == null ? null : String(item));
      }).filter((v: any) => v !== null) as string[];

  // Deduplica mantenendo l'ordine
      const deduped: string[] = [];
      const seen = new Set<string>();
      for (const v of resolvedList) {
        if (!seen.has(v)) {
          seen.add(v);
          deduped.push(v);
        }
      }

  // Se la normalizzazione ha modificato ciò che è salvato, persisti nuovamente su localStorage per i prossimi caricamenti
      try {
        const rawJson = localStorage.getItem('travelmate-favorites') || '[]';
        const rawArr = JSON.parse(rawJson);
  // Confronta i risultati di JSON.stringify per rilevare modifiche
        if (JSON.stringify(rawArr) !== JSON.stringify(deduped)) {
          localStorage.setItem('travelmate-favorites', JSON.stringify(deduped));
        }
      } catch (e) {
  // ignora errori di storage
      }

      favorites = deduped;
    }

  // Normalizza gli elementi dell'itinerario (destinationId) quando possibile
    let itinerary: any[] = [];
    if (Array.isArray(rawItinerary)) {
      itinerary = rawItinerary.map((it: any) => {
        let destId: string | null = null;
        if (it && typeof it === 'object') {
          if (it.destinationId) destId = resolveId(it.destinationId) || String(it.destinationId);
          else if (it.destination && (it.destination.id || it.destination.name)) destId = resolveId(it.destination) || it.destination.id || it.destination.name;
          else if (it.id && destinations.find(d => d.id === it.id)) destId = it.id;
        }
        return { ...it, destinationId: destId };
      });

  // Persiste l'itinerario normalizzato su storage se ha cambiato forma (euristica semplice)
      try {
        const rawJsonIt = localStorage.getItem('travelmate-itinerary') || '[]';
        const rawArrIt = JSON.parse(rawJsonIt);
        if (JSON.stringify(rawArrIt) !== JSON.stringify(itinerary)) {
          localStorage.setItem('travelmate-itinerary', JSON.stringify(itinerary));
        }
      } catch (e) {
  // ignora errori di storage
      }
    }

    // Carica anche l'ultimo stato di ricerca da sessionStorage
    let lastSearchState = null;
    try {
      const savedSearch = sessionStorage.getItem('travelmate-last-search');
      if (savedSearch) {
        const parsed = JSON.parse(savedSearch);
        const timeDiff = Date.now() - parsed.timestamp;
        // Considera valido se ha meno di 30 minuti
        if (timeDiff < 30 * 60 * 1000) {
          lastSearchState = {
            query: parsed.query || '',
            continent: parsed.continent || '',
            timestamp: parsed.timestamp
          };
        }
      }
    } catch (e) {
      // ignora errori di parsing
    }

    dispatch({ type: 'LOAD_FROM_STORAGE', payload: { favorites, itinerary, lastSearchState } });
    
  // Forza sempre il tema scuro
    const root = document.documentElement;
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }, []);

  // Salva su localStorage quando lo stato cambia
  useEffect(() => {
    localStorage.setItem('travelmate-favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  useEffect(() => {
    localStorage.setItem('travelmate-itinerary', JSON.stringify(state.itinerary));
  }, [state.itinerary]);

  const addToFavorites = (destinationId: string) => {
  // Prova a risolvere all'id canonico del dataset per id o nome (case-insensitive)
    const resolve = (ident: string) => {
      if (!ident) return ident;
  // Se corrisponde a un id del dataset, restituiscilo
      const byId = destinations.find(d => d.id === ident);
      if (byId) return byId.id;
  // Prova a confrontare per nome (case-insensitive)
      const byName = destinations.find(d => d.name.toLowerCase() === ident.toLowerCase());
      if (byName) return byName.id;
  // fallback all'identificatore fornito
      return ident;
    };

    const resolved = resolve(destinationId);
    dispatch({ type: 'ADD_TO_FAVORITES', payload: resolved });
  };

  const removeFromFavorites = (destinationId: string) => {
    const resolve = (ident: string) => {
      if (!ident) return ident;
      const byId = destinations.find(d => d.id === ident);
      if (byId) return byId.id;
      const byName = destinations.find(d => d.name.toLowerCase() === ident.toLowerCase());
      if (byName) return byName.id;
      return ident;
    };

    const resolved = resolve(destinationId);
    dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: resolved });
  };

  const addToItinerary = (item: Omit<ItineraryItem, 'id' | 'addedAt'>) => {
    const newItem: ItineraryItem = {
      ...item,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TO_ITINERARY', payload: newItem });
  };

  const removeFromItinerary = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_ITINERARY', payload: itemId });
  };

  const isFavorite = (destinationId: string) => {
    if (!destinationId) return false;
  // risolvi in modo analogo ad add/remove
    const byId = destinations.find(d => d.id === destinationId);
    if (byId && state.favorites.includes(byId.id)) return true;
    const byName = destinations.find(d => d.name.toLowerCase() === destinationId.toLowerCase());
    if (byName && state.favorites.includes(byName.id)) return true;
    return state.favorites.includes(destinationId);
  };

  const setLastSearch = (query: string, continent: string) => {
    dispatch({ type: 'SET_LAST_SEARCH', payload: { query, continent } });
    // Salva anche su sessionStorage per persistenza temporanea
    sessionStorage.setItem('travelmate-last-search', JSON.stringify({
      query,
      continent,
      timestamp: Date.now()
    }));
  };

  const getLastSearch = () => {
    // Prima controlla lo state in memoria
    if (state.lastSearchState) {
      const timeDiff = Date.now() - state.lastSearchState.timestamp;
      // Considera valido se ha meno di 30 minuti
      if (timeDiff < 30 * 60 * 1000) {
        return {
          query: state.lastSearchState.query,
          continent: state.lastSearchState.continent
        };
      }
    }

    // Fallback su sessionStorage
    try {
      const saved = sessionStorage.getItem('travelmate-last-search');
      if (saved) {
        const parsed = JSON.parse(saved);
        const timeDiff = Date.now() - parsed.timestamp;
        if (timeDiff < 30 * 60 * 1000) {
          return {
            query: parsed.query || '',
            continent: parsed.continent || ''
          };
        }
      }
    } catch (e) {
      // ignora errori di parsing
    }

    return null;
  };

  const value: AppContextType = {
    state,
    dispatch,
    addToFavorites,
    removeFromFavorites,
    addToItinerary,
    removeFromItinerary,
    isFavorite,
    setLastSearch,
    getLastSearch,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}