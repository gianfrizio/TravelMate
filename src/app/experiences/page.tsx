import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

export const metadata = { title: 'Esperienze - TravelMate', description: 'Scopri esperienze locali e attività uniche.' };

export default function ExperiencesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Star className="w-6 h-6"/> Esperienze Locali</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Attività selezionate da operatori locali.</p>
      </header>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Pagina iniziale per esperienze locali.</p>
      <Link href="/services" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Torna ai Servizi</Link>
    </main>
  );
}
