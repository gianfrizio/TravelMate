import React from 'react';
import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';

export const metadata = { title: 'Aiuto - TravelMate', description: 'Canali di aiuto e supporto per i viaggiatori.' };

export default function HelpPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><LifeBuoy className="w-6 h-6"/> Aiuto</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Canali di supporto e contatti rapidi.</p>
      </header>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Per domande urgenti usa il numero di emergenza indicato nella pagina Supporto.</p>
      <Link href="/support" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Vai al Supporto</Link>
    </main>
  );
}
