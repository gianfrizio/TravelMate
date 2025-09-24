import React from 'react';
import Link from 'next/link';

export const metadata = { title: 'Carriere - TravelMate', description: 'Posizioni aperte e opportunità di lavoro.' };

export default function CareersPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Carriere</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Scopri le posizioni aperte e come candidarti.</p>
      </header>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Nessuna posizione attiva al momento.</p>
      <Link href="/azienda" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Torna ad Azienda</Link>
    </main>
  );
}
