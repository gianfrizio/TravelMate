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

    let aborted = false;
        const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // Richiedi suggerimenti localizzati in italiano
        	    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=5&lang=it`);
        const data = await res.json();
        if (!aborted) setSuggestions(data.suggestions || []);
      } catch (err) {
        if (!aborted) setSuggestions([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    const t = setTimeout(fetchSuggestions, 250);
    return () => {
      aborted = true;
      clearTimeout(t);
    };
  }, [q]);

  // set initial query or focus when props change
  useEffect(() => {
    if (typeof initialQuery === 'string') {
      setQ(initialQuery);
      // If initialQuery comes from a continent link, do not open the suggestions list automatically.
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
        onSelect(s);
        setShow(false);
        setQ(s.name);
        if (typeof onQueryChange === 'function') onQueryChange(s.name);
        if (typeof onEnter === 'function') onEnter(s.name);
      } else {
        // No suggestion selected: notify parent of raw enter
        if (typeof onEnter === 'function') onEnter(q);
        setShow(false);
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
              onClick={() => { onSelect(s); setShow(false); setQ(s.name); setActiveIndex(-1); }}
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
