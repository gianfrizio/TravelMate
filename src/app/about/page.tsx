import React from 'react';
import Link from 'next/link';

export const metadata = { title: 'Chi Siamo - TravelMate', description: 'Informazioni su TravelMate e la nostra missione.' };

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Chi Siamo</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Informazioni sulla nostra azienda e il team.</p>
      </header>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Contenuti in arrivo.</p>
      <Link href="/azienda" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Torna ad Azienda</Link>
    </main>
  );
}
