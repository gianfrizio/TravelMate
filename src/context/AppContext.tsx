"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Destination, User, ItineraryItem } from '@/types';
import { destinations } from '@/data/destinations';

interface AppState {
  user: User | null;
  favorites: string[];
  itinerary: ItineraryItem[];
  isLoading: boolean;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'ADD_TO_FAVORITES'; payload: string }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
  | { type: 'ADD_TO_ITINERARY'; payload: ItineraryItem }
  | { type: 'REMOVE_FROM_ITINERARY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<AppState> };

const initialState: AppState = {
  user: null,
  favorites: [],
  itinerary: [],
  isLoading: false,
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    // Read raw saved values
    const rawFavorites: unknown = JSON.parse(localStorage.getItem('travelmate-favorites') || '[]');
    const rawItinerary: unknown = JSON.parse(localStorage.getItem('travelmate-itinerary') || '[]');

    // Helper to resolve identifiers (id or name) to canonical dataset id
    const normalizeKey = (raw: unknown) => {
      if (raw == null) return '';
      let s = String(raw).trim();
      // If the string contains a comma like 'Rome, Italy', take the first part
      if (s.includes(',')) s = s.split(',')[0].trim();
      return s.toLowerCase();
    };

    const resolveId = (ident: unknown): string | null => {
      if (!ident) return null;
      // If it's an object with id or name, prefer those
      if (typeof ident === 'object' && ident !== null) {
        // @ts-ignore - dynamic shape from localStorage
        if ('id' in ident && (ident as any).id) return String((ident as any).id);
        // @ts-ignore
        if ('name' in ident && (ident as any).name) return String((ident as any).name);
      }

      const s = String(ident).trim();

      // Try match by id first (exact)
      const byId = destinations.find(d => d.id === s);
      if (byId) return byId.id;

      // Normalize and try matching by name more flexibly
      const sNorm = normalizeKey(s);
      const byExactName = destinations.find(d => d.name.toLowerCase() === sNorm);
      if (byExactName) return byExactName.id;

      // Try substring matches (e.g. 'Rome' vs 'Rome, Italy' or 'New York City')
      const byIncludes = destinations.find(d => d.name.toLowerCase().includes(sNorm) || sNorm.includes(d.name.toLowerCase()));
      if (byIncludes) return byIncludes.id;

      return null;
    };

    // Normalize favorites: try to resolve saved values to canonical ids when possible.
    // Keep unresolved raw strings so they remain visible in the UI (we don't want to silently drop user's saved values).
    let favorites: string[] = [];
    if (Array.isArray(rawFavorites)) {
      const resolvedList = rawFavorites.map((item: any) => {
        const resolved = resolveId(item);
        // If resolved, use canonical id; otherwise keep original raw value (stringified)
        return resolved || (item == null ? null : String(item));
      }).filter((v: any) => v !== null) as string[];

      // Deduplicate while preserving order
      const deduped: string[] = [];
      const seen = new Set<string>();
      for (const v of resolvedList) {
        if (!seen.has(v)) {
          seen.add(v);
          deduped.push(v);
        }
      }

      // If normalization changed what's stored, persist it back to localStorage for future loads
      try {
        const rawJson = localStorage.getItem('travelmate-favorites') || '[]';
        const rawArr = JSON.parse(rawJson);
        // Compare simple JSON.stringify results to detect change
        if (JSON.stringify(rawArr) !== JSON.stringify(deduped)) {
          localStorage.setItem('travelmate-favorites', JSON.stringify(deduped));
        }
      } catch (e) {
        // ignore storage errors
      }

      favorites = deduped;
    }

    // Normalize itinerary entries' destinationId when possible
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

      // Persist normalized itinerary back to storage if it changed shape (simple heuristic)
      try {
        const rawJsonIt = localStorage.getItem('travelmate-itinerary') || '[]';
        const rawArrIt = JSON.parse(rawJsonIt);
        if (JSON.stringify(rawArrIt) !== JSON.stringify(itinerary)) {
          localStorage.setItem('travelmate-itinerary', JSON.stringify(itinerary));
        }
      } catch (e) {
        // ignore storage errors
      }
    }

    dispatch({ type: 'LOAD_FROM_STORAGE', payload: { favorites, itinerary } });
    
    // Forza sempre il tema scuro
    const root = document.documentElement;
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('travelmate-favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  useEffect(() => {
    localStorage.setItem('travelmate-itinerary', JSON.stringify(state.itinerary));
  }, [state.itinerary]);

  const addToFavorites = (destinationId: string) => {
    // Try to resolve to canonical dataset id by id or name (case-insensitive)
    const resolve = (ident: string) => {
      if (!ident) return ident;
      // If matches an existing dataset id, return it
      const byId = destinations.find(d => d.id === ident);
      if (byId) return byId.id;
      // Try to match by name (case-insensitive)
      const byName = destinations.find(d => d.name.toLowerCase() === ident.toLowerCase());
      if (byName) return byName.id;
      // fallback to provided identifier
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
    // resolve similarly to add/remove
    const byId = destinations.find(d => d.id === destinationId);
    if (byId && state.favorites.includes(byId.id)) return true;
    const byName = destinations.find(d => d.name.toLowerCase() === destinationId.toLowerCase());
    if (byName && state.favorites.includes(byName.id)) return true;
    return state.favorites.includes(destinationId);
  };

  const value: AppContextType = {
    state,
    dispatch,
    addToFavorites,
    removeFromFavorites,
    addToItinerary,
    removeFromItinerary,
    isFavorite,
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