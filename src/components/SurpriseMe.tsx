"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function SurpriseMe({ defaultCount = 3 }: { defaultCount?: number }) {
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRandom = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/random-destinations?n=${defaultCount}&weighted=1`);
      if (resp.ok) {
        const data = await resp.json();
        setResults(data.results || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Non sai dove andare?</h3>
          <p className="text-sm text-gray-500">Clicca per ricevere alcune mete consigliate casualmente</p>
        </div>
        <div>
          <Button onClick={fetchRandom} size="md">{loading ? 'Caricamento...' : 'Sorprendimi'}</Button>
        </div>
      </div>

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((r) => (
            <div key={r.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-gray-500">{r.country}</div>
              <div className="mt-2 text-xs text-gray-500">
                {(r.activities || []).slice(0,3).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <div className="text-lg">{a.icon}</div>
                    <div>{a.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
