import React from 'react';
import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';

export const metadata = { title: 'FAQ - TravelMate', description: 'Domande frequenti e risposte utili per i viaggiatori.' };

export default function FaqPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><LifeBuoy className="w-6 h-6"/> FAQ</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Tutte le risposte alle tue domande più comuni.</p>
      </header>

      <section className="space-y-4">
        <details className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
          <summary className="font-medium">Come posso modificare un itinerario?</summary>
          <p className="text-sm text-slate-500 mt-2">Vai nella sezione Pianifica e modifica le tappe nel tuo piano.</p>
        </details>
        <details className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
          <summary className="font-medium">Come funziona la pianificazione degli itinerari?</summary>
          <p className="text-sm text-slate-500 mt-2">Compila le preferenze e ricevi un itinerario suggerito che puoi modificare liberamente.</p>
        </details>
        <details className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
          <summary className="font-medium">Offrite pacchetti per gruppi?</summary>
          <p className="text-sm text-slate-500 mt-2">Sì, contattaci per una proposta personalizzata per gruppi e viaggi aziendali.</p>
        </details>
      </section>

      <Link href="/support" className="inline-block mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg">Torna al Supporto</Link>
    </main>
  );
}
