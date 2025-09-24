import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Guide - TravelMate',
  description: 'Guide di viaggio curate per destinazioni e suggerimenti pratici.',
};

export default function GuidesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><BookOpen className="w-6 h-6"/> Guide di viaggio</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Qui troverai guide pratiche e consigli per le principali destinazioni.</p>
      </header>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Questa pagina è una versione iniziale. A breve aggiungeremo contenuti dettagliati per ogni meta.</p>

      <Link href="/services" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Torna ai Servizi</Link>
    </main>
  );
}
