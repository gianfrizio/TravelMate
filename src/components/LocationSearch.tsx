"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';

type Suggestion = { id: string; name: string; lat?: number; lon?: number; country?: string };

export default function LocationSearch({ onSelect, initialQuery, autoFocus, onQueryChange, onEnter }: { onSelect: (s: Suggestion) => void; initialQuery?: string; autoFocus?: boolean; onQueryChange?: (q: string) => void; onEnter?: (q: string) => void }) {
  const [q, setQ] = useState(initialQuery || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    // Non fare fetch se abbiamo appena selezionato un suggerimento
    if (justSelectedRef.current) {
      return;
    }

    let aborted = false;
        const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // Richiedi suggerimenti localizzati in italiano
        console.log('[LocationSearch] Fetching suggestions for:', q);
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=5&lang=it`);
        const data = await res.json();
        console.log('[LocationSearch] API response:', data);
        if (!aborted) {
          setSuggestions(data.suggestions || []);
          // Only show suggestions if we didn't just select one
          if ((data.suggestions || []).length > 0 && !justSelectedRef.current) {
            setShow(true);
          }
        }
      } catch (err) {
        console.error('[LocationSearch] Error fetching suggestions:', err);
        if (!aborted) setSuggestions([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    const t = setTimeout(fetchSuggestions, 1000);
    return () => {
      aborted = true;
      clearTimeout(t);
    };
  }, [q]);

  // set initial query or focus when props change
  useEffect(() => {
    if (typeof initialQuery === 'string' && initialQuery !== q && !justSelectedRef.current) {
      setQ(initialQuery);
      setShow(false);
    }
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [initialQuery, autoFocus]);

  // Navigazione da tastiera per i suggerimenti
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      setShow(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const s = suggestions[activeIndex];
        setShow(false);
        setSuggestions([]);
        setQ(s.name);
        if (typeof onQueryChange === 'function') onQueryChange(s.name);
        onSelect(s);
        if (typeof onEnter === 'function') onEnter(s.name);
        // Set flag after onSelect to prevent reopening suggestions
        justSelectedRef.current = true;
        setTimeout(() => { justSelectedRef.current = false; }, 500);
      } else {
        // No suggestion selected: notify parent of raw enter
        setShow(false);
        if (typeof onEnter === 'function') onEnter(q);
      }
    } else if (e.key === 'Escape') {
      setShow(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
        <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setShow(true); if (typeof onQueryChange === 'function') onQueryChange(e.target.value); }}
          placeholder="Cerca città o destinazione..."
          aria-label="Cerca città o destinazione"
          role="combobox"
          aria-expanded={show}
          aria-controls="location-suggestions"
          onKeyDown={onKeyDown}
          onFocus={() => {
            // Riapri i suggerimenti se ci sono e non abbiamo appena selezionato
            if (suggestions.length > 0 && !justSelectedRef.current && q.length >= 2) {
              setShow(true);
            }
          }}
          onBlur={() => {
            // Chiudi i suggerimenti quando l'input perde il focus
            // Usa un timeout per permettere il click sui suggerimenti
            setTimeout(() => {
              if (!justSelectedRef.current) {
                setShow(false);
              }
            }, 150);
          }}
          className="w-full px-3 py-3 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {show && suggestions.length > 0 && (
        <ul
          id="location-suggestions"
          ref={listRef}
          role="listbox"
          aria-label="Suggerimenti destinazioni"
          className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-auto"
        >
          {suggestions.map((s, index) => (
            <li
              id={`location-option-${index}`}
              key={s.id}
              role="option"
              aria-selected={activeIndex === index}
              onClick={() => { 
                setShow(false); 
                setSuggestions([]);
                setQ(s.name); 
                setActiveIndex(-1); 
                onSelect(s);
                // Set flag after onSelect to prevent reopening suggestions
                justSelectedRef.current = true;
                setTimeout(() => { justSelectedRef.current = false; }, 500);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center space-x-2 ${
                activeIndex === index ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              <span className="text-gray-900 dark:text-white">{s.name}</span>
            </li>
          ))}
        </ul>
      )}
      {show && loading && suggestions.length === 0 && q.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
            <span className="text-sm">Cerco destinazioni...</span>
          </div>
        </div>
      )}
    </div>
  );
}
